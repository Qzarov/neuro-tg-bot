import User, { UserRole } from "../models/user";
import { Commands, HasAccessParams, HasAccessResult } from "./types";

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
            return this.checkBotAccess(fromUserData.role, toUserData.role)
        }

        /**
         * Handle /makeAdmin and /removeAdmin
         */
        if ([Commands.makeAdmin, Commands.removeAdmin].includes(command)) {
            return this.checkChangeAdminAccess(fromUserData.role, toUserData.role)
        }

        // TODO add other commands access checking

        return { result: false, message: "unknown command" }
    }

    static checkAdminAccess(userRole: UserRole) {
        return userRole === UserRole.admin
            ? { result: true, message: "success" } 
            : { result: false, message: "Вы не обладаете правами администратора" }
    }

    static checkBotAccess(userFromRole: UserRole, userToRole: UserRole): HasAccessResult {
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
}