import User, { UserRole } from "../models/user";
import HistoryService, { HistoryRecordType } from "../services/history.service";
import { Command, HasAccessResult, Result } from "./types";

/**
 * Перед каждой командой должна идти проверка с помощью метода RolesHandler.hasAccess()
 * Исключения:
 *  - /start
 *  - /requestAccess
 *  - /user
 *  - /exitAdmin
 */
export default class RolesHandler {

    /**
     * Проверяет доступ пользователя к командам из списка ниже. Для корректной обработки 
     * некоторые команды требуют дополнительных параметров (указано в скобках)
     *  - /admin
     *  - /grantAccess  (требует params.userTo)
     *  - /revokeAccess (требует params.userTo)
     *  - /makeAdmin    (требует params.userTo)
     *  - /removeAdmin  (требует params.userTo)
     *  - /addTokens    (требует params.userTo и params.tokens) 
     *  - /takeTokens    (требует params.userTo и params.tokens) 
     * 
     * Остальные команды: TODO
     * 
     * @return Если требуемый параметр не предоставлен, возвращает `false`
     */
    static hasAccessToCommand(from: User, command: Command): HasAccessResult  {
        const fromUserData = from.getData()
        if (!fromUserData.role) {
            console.error(`⛔️  RolesHandler.hasAccess() get user with undefined role (${fromUserData.tgId}, ${fromUserData.username})`)
            return {result: false, message: "userFrom has undefined role"};
        }

        if ([
            Command.start,
            Command.requestAccess,
            Command.user,
        ].includes(command)) {
            return { result: true, message: "success" } 
        }

        /**
         * Handle user's commands
         */
        if ([
            Command.state,
            Command.chooseNeuro,
            Command.useGPT,
            Command.useGemini,
            Command.endUsingNeuro,
        ].includes(command)) {
            return this.checkUserAccess(fromUserData.role);
        }

        /**
         * Handle admin's commands
         */
        if ([
            Command.admin,
            Command.exitAdminMode,
            Command.grantAccess,
            Command.revokeAccess,
            Command.addTokens,
            Command.takeTokens,
        ].includes(command)) {
            return this.checkAdminAccess(fromUserData.role);
        }

        /**
         * Handle super's commands
         */
        if ([
            Command.makeAdmin,
            Command.removeAdmin,
            Command.getApiTokens,
            Command.addApiToken,
            Command.deleteApiToken,
        ]. includes(command)) {
            return this.checkSuperAccess(fromUserData.role);
        }

        return { result: false, message: "unknown command" }
    }

    private static checkUserAccess(userRole: UserRole) {
        return userRole === UserRole.user 
            || userRole === UserRole.admin 
            || userRole === UserRole.super
                ? { result: true, message: "success" } 
                : { result: false, message: "У вас нет доступа к этой команде" }
    }

    private static checkAdminAccess(userRole: UserRole) {
        return userRole === UserRole.admin || userRole === UserRole.super
            ? { result: true, message: "success" } 
            : { result: false, message: "У вас нет доступа к этой команде" }
    }

    private static checkSuperAccess(userRole: UserRole) {
        return userRole === UserRole.super
            ? { result: true, message: "success" } 
            : { result: false, message: "У вас нет доступа к этой команде" }
    }

    static checkChangeBotAccess(userFromRole: UserRole, userToRole: UserRole): HasAccessResult {
        if (![UserRole.admin, UserRole.super].includes(userFromRole)) {
            return { result: false, message: "У вас нет доступа к этой команде" };
        }

        if (userFromRole === UserRole.super && userToRole !== UserRole.super 
            || ( userFromRole === UserRole.admin && 
                (userToRole === UserRole.user || userToRole === UserRole.guest)
            )
        ) { 
            return { result: true, message: "success"}; 
        } else {
            return { result: false, message: "Вы не можете изменить роль этого пользователя"};
        }
    }

    static checkChangeUser(userFromRole: UserRole, userToRole: UserRole): HasAccessResult {
        const userAdminOrSuper = [UserRole.admin, UserRole.super].includes(userFromRole)
        if (!userAdminOrSuper) {
            return { result: false, message: "У вас нет доступа к этой команде" };
        }

        const bothAdmins = userFromRole == UserRole.admin && userToRole === UserRole.admin
        const changeSuperRole = userToRole === UserRole.super

        if (bothAdmins || changeSuperRole) { 
            return { result: false, message: "Вы не можете изменить данные этого пользователя"};             
        } else {
            return { result: true, message: "success"};
        }
    }

    static async updateUserRole(
        userFrom: User, 
        userTo: User, 
        command: Command
    ): Promise<Result> {
        /**
         * Check access to change role 
         */
        const access: HasAccessResult = RolesHandler.checkChangeUser(
            userFrom.getRole(), userTo.getRole()
        )
        if (!access.result) {
            return {
                result: false,
                message: access.message,
            }
        }

        /**
         * Change role
         */
        let userToNewRole;
        switch(command) {
            case Command.revokeAccess:
                userToNewRole = UserRole.guest;
                break;

            case Command.grantAccess:
                userToNewRole = UserRole.user;
                break;

            case Command.makeAdmin:
                userToNewRole = UserRole.admin;
                break;

            case Command.removeAdmin:
                userToNewRole = UserRole.user;
                break;

            default:
                userToNewRole = UserRole.guest;
        }

        const userToData = userTo.getData();

        const roleChanges: boolean = userToData.role !== userToNewRole
        if (roleChanges) {
            await userTo.update({ role: userToNewRole });

            const historyService = new HistoryService();
            historyService.create({
                type: HistoryRecordType.ROLE_CHANGED,
                userId: userFrom.getTgId(),
                data: {
                    userToId: userToData.tgId,
                    userToOldRole: userTo.getRole(),
                    userToNewRole: userToNewRole,
                },
            });

            return {
                result: true,
                message: `User's role changed`,
                updated: true,
            }
        } else {
            return {
                result: true,
                message: `User's role doesn't changed`,
                updated: false,
            }
            // replyText = `Пользователь уже имеет роль ${userToData.role}.`
        }
    }
}