import User, { UserRole } from "../models/user";
import { Commands, HasAccessParams, HasAccessResult, Result } from "./types";

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
     * 
     * Остальные команды: TODO
     * 
     * @return Если требуемый параметр не предоставлен, возвращает `false`
     */
    static hasAccess(from: User, command: Commands, params?: HasAccessParams): HasAccessResult  {
        // TODO delegate data checking?
        const fromUserData = from.getData()
        if (!fromUserData.role) {
            console.log(`⛔️  RolesHandler.hasAccess() get user with undefined role (${fromUserData.tgId}, ${fromUserData.username})`)
            return {result: false, message: "userFrom has undefined role"};
        }

        /**
         * Handle /admin
         */
        if (command === Commands.admin) {
            return this.checkAdminAccess(fromUserData.role);
        }

        /**
         * Block for commands that require params.userTo field.
         * Check if userTo is not undefined & it's role is not undefined
         */
        const toUserData = params?.userTo?.getData()
        if (!toUserData?.role) {
            console.log(`⛔️  RolesHandler.hasAccess() get undefined params.userTo.role:`, params)
            return { result: false, message: "params.userTo has undefined role" };
        }

        /**
         * Handle /grantAccess and /revokeAccess
         */
        if ([Commands.grantAccess, Commands.revokeAccess].includes(command)) {
            return this.checkChangeBotAccess(fromUserData.role, toUserData.role)
        }

        /**
         * Handle /makeAdmin and /removeAdmin
         */
        if ([Commands.makeAdmin, Commands.removeAdmin].includes(command)) {
            return this.checkChangeAdminAccess(fromUserData.role, toUserData.role)
        }

        // TODO add access checking /addTokens and /takeTokens

        return { result: false, message: "unknown command" }
    }

    static checkAdminAccess(userRole: UserRole) {
        return userRole === UserRole.admin || userRole === UserRole.super
            ? { result: true, message: "success" } 
            : { result: false, message: "Вы не обладаете правами администратора" }
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

    static checkChangeAdminAccess(userFromRole: UserRole, userToRole: UserRole): HasAccessResult {
        if (![UserRole.super].includes(userFromRole)) {
            return { result: false, message: "У вас нет доступа к этой команде" };
        }

        if (![UserRole.super].includes(userToRole)) { 
            return { result: true, message: "success"}; 
        } else {
            return { result: false, message: "Вы не можете изменить роль этого пользователя"};
        }
    }

    static async updateUserRole(
        userFrom: User, 
        userTo: User, 
        command: Commands
    ): Promise<Result> {
        /**
         * Check access to change role 
         */
        const access: HasAccessResult = RolesHandler.hasAccess(
            userFrom, command, { userTo: userTo}
        )
        if (!access.result) {
            // await this.bot.sendMessage(Number(from.getTgId()), replyText)
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
            case Commands.revokeAccess:
                userToNewRole = UserRole.guest;
                break;

            case Commands.grantAccess:
                userToNewRole = UserRole.user;
                break;

            case Commands.makeAdmin:
                userToNewRole = UserRole.admin;
                break;

            case Commands.removeAdmin:
                userToNewRole = UserRole.user;
                break;

            default:
                userToNewRole = UserRole.guest;
        }

        const userToData = userTo.getData();

        const roleChanges: boolean = userToData.role !== userToNewRole
        if (roleChanges) {
            await userTo.update({ role: userToNewRole });
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