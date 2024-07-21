import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from "node-telegram-bot-api";
import { replyKeyboardButtons } from "../lib/telegram/const/buttons";
import TgBot from "../lib/telegram/tgBot";
import User, { UserRole, UserState } from "../models/user";
import { collections, UserService } from "../services/index";
import { CallbackData, CommandParams, Command, UsernameValidationResult, HasAccessResult } from "./types";
import RolesHandler from "./roles.handler";
import parseStringCommand from "./command.parser";
import ApiTokenService from "../services/apiTokens.service";
import HistoryService, { HistoryRecordType } from "../services/history.service";
import { ApiTokenData, ApiTokenType } from "../models/apiToken";

export default class CommandsHandler {
    constructor(
        private bot: TgBot,
    ) {} 

    public async handleCommand(from: User, stringCommand: string) {
        try {
            /**
             * Parse command and params from string
             */
            const {command, params} = parseStringCommand(stringCommand)
            console.log('command:', command, ', params:', params);
            
            /**
             * Check if user has access to this command
             */
            const access: HasAccessResult = RolesHandler.hasAccessToCommand(from, command)
            if (!access.result) {
                await this.bot.sendMessage(from.getTgId(), access.message)
                return;
            }

            switch(command) {
                case Command.start:
                    await this.handleStart(from)
                    break;

                case Command.admin:
                    await this.handleAdmin(from)
                    break;

                case Command.requestAccess:
                    await this.handleRequestAccess(from)
                    break;
                    
                case Command.grantAccess:
                    await this.handleCommandWithUsernameSearch(
                        Command.grantAccess,
                        from, 
                        params,
                        `Теперь пользователь @username имеет доступ к боту`,
                        `Вам выдали доступ к боту`
                    )
                    break;

                case Command.revokeAccess:
                    await this.handleCommandWithUsernameSearch(
                        Command.revokeAccess, 
                        from, 
                        params,
                        `Теперь пользователь @username не имеет доступ к боту`,
                        `У вас отозвали доступ к боту`
                    )
                    break;

                case Command.makeAdmin:
                    await this.handleCommandWithUsernameSearch(
                        Command.makeAdmin,
                        from, 
                        params,
                        `Теперь пользователь @username администратор`,
                        `Вам была выдана роль админстратора`
                    )
                    break;

                case Command.removeAdmin:                    
                    await this.handleCommandWithUsernameSearch(
                        Command.removeAdmin,
                        from, 
                        params,
                        `Пользователь @username больше не администратор`,
                        `Права администратора были отозваны`
                    )
                    break;

                case Command.addTokens: 
                    await this.handleCommandWithUsernameSearch(
                        Command.addTokens,
                        from,
                        params,
                        `Пользователю @username добавлено tokens токенов. Всего: tokensTotal`,
                        `Вам начислено tokens токенов. Всего: tokensTotal`
                    );
                    break;

                case Command.takeTokens: 
                    await this.handleCommandWithUsernameSearch(
                        Command.takeTokens,
                        from,
                        params,
                        `Количество токенов пользователя @username уменьшено на tokens. Всего: tokensTotal`,
                        `Количество ваших токенов уменьшено на tokens. Всего: tokensTotal`
                    );
                    break;

                case Command.exitAdminMode:
                    await this.handleExitAdminMode(from);
                    break;

                case Command.state:
                    await this.handleState(from);
                    break;

                case Command.chooseNeuro:
                    await this.handleChooseNeuro(from)
                    break;

                case Command.useGPT:
                    await this.handleSetUseGpt(from)
                    break;

                case Command.useGemini:
                    await this.handleSetUseGemini(from)
                    break;

                case Command.endUsingNeuro:
                    await this.handleEndUsingNeuro(from)
                    break;

                case Command.getApiTokens:
                    await this.handleApiTokenCommand(Command.getApiTokens, from, params)
                    break;

                case Command.addApiToken:
                    await this.handleApiTokenCommand(Command.addApiToken, from, params)
                    break;
                
                case Command.deleteApiToken:
                    await this.handleApiTokenCommand(Command.deleteApiToken, from, params)
                    break;

                default:
                    await this.handleUnknownCommand(from)
            }
        } catch (err) {
            console.error("Error while handling command:", err);
            await this.bot.sendMessage(Number(from.getTgId()), `Ошибка: ` + (err as Error).message);
        }
    }

    public async handleAdmin(from: User) {
        let replyText: string = "Welcome to the Crypto Tarot!"
        from.update({ state: UserState.adminMode});
        replyText = 
            "Теперь ты в режиме администратора. Доступные команды:\n" + 
            "- /grantAccess username - выдать пользователю @username доступ к боту\n" +
            "- /revokeAccess username - отозвать у пользователя @username доступ к боту\n" +
            "- /makeAdmin username - сделать пользователя @username администратором\n" + 
            "- /revokeAdmin username - отозвать у пользователя @username права администратора";
            "- /addTokens username tokens - добавить пользователю @username tokens токенов";
            "- /takeTokens username tokens - уменьшить количество токенов пользователя @username на tokens";
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleRequestAccess(from: User) {
        let replyText: string = "Доступ уже есть"
        
        if (from.hasAccessToBot()) {
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
            return;
        }

        // Get all admins from DB
        if (collections.users) {
            const userService = new UserService();
            const adminsData = await userService.findAll({role: UserRole.admin});
            
            const username = from.getData().username;
            const userId = from.getData().tgId;
            const messageForAdmin = `Пользователь @${username} запросил доступ`;
            const keyboard: InlineKeyboardMarkup = {
                inline_keyboard: [
                    [
                        {text: 'Одобрить', callback_data: `${CallbackData.approveAccess}:${userId}`},
                        {text: 'Отклонить', callback_data: `${CallbackData.rejectAccess}:${userId}`},
                    ]
                ]
            }
            for (const adminData of adminsData) {
                const admin: User = new User(adminData);
                await this.bot.sendMessage(admin.getTgId(), messageForAdmin, keyboard)
            }

            replyText = "Запрос доступа успешно отправлен"
            await this.bot.sendMessage(Number(from.getTgId()), replyText)
        } else {
            throw new Error(`⛔️  Cannot creater new user: Users collection is undefined`);
        }
    }

    public async handleExitAdminMode(from: User) {
        let replyText = `Текущий статус: ${UserState[from.getState()]}`

        if (from.getState() === UserState.adminMode) {
            await from.update({ state: UserState.start });
            replyText = `Вы вышли из режима администратора. ` + replyText; 
        }
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleState(from: User) {
        const state = from.getState()
        const replyText = `Твой текущий статус: ${UserState[state]}`
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    public async handleStart(from: User) {
        let replyText: string = "Добро пожаловать в мастерскую предсказаний! Выбери твоего таролога."
        
        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
                [
                    replyKeyboardButtons.chooseNeuralNetwork
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
    
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }
    
    public async handleChooseNeuro(from: User) {
        let replyText: string = "Хорошо. Выбери нейросеть, которая разложит карты"

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.useGPT,
                replyKeyboardButtons.useGemini,
            ]
        ]}

        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }

    public async handleSetUseGpt(from: User) {
        from.update({ state: UserState.usingGPT })

        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
            [
                replyKeyboardButtons.endUsingNeuro,
            ]
        ]}

        let replyText: string = "Прекрасный выбор! GPT разложит карты без обмана и смс. Отправь свой запрос и GPT на него ответит 🙌🏻"
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }

    public async handleSetUseGemini(from: User) {
        // usersState.updateUserState(userId, UserState.usingGemini)

        // const keyboard: ReplyKeyboardMarkup = {
        //     keyboard: [
        //     [
        //         replyKeyboardButtons.endUsingNeuro,
        //     ]
        // ]}

        let replyText: string = `⚠️ Таролог Gemini пока не предотавляет своих услуг ⚠️`
        await this.bot.sendMessage(Number(from.getTgId()), replyText, /* keyboard */)
    }

    public async handleEndUsingNeuro(from: User) {
        from.update({ state: UserState.start})
        let replyText: string = "Надеюсь, что это было полезно. Убираю карты 🃏🃏🃏"
        const keyboard: ReplyKeyboardMarkup = {
            keyboard: [
                [
                    replyKeyboardButtons.chooseNeuralNetwork
                ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        }
        await this.bot.sendMessage(Number(from.getTgId()), replyText, keyboard)
    }
    
    public async handleUnknownCommand(from: User) {
        let replyText: string = "Прости, человек, но карты не могут на это ответить 😅"
        await this.bot.sendMessage(Number(from.getTgId()), replyText)
    }

    /**
     * Processes commands that require the user name of another user to be specified:
     *  - /grantAccess
     *  - /revokeAccess
     *  - /makeAdmin
     *  - /removeAdmin
     *  - /addTokens
     *  - /takeTokens
     */
    private async handleCommandWithUsernameSearch(
        command: Command, 
        userFrom: User, 
        params?: CommandParams,
        successFromAnswer?: string,
        successToAnswer?: string,
    ) {

        const validation = await this.validateCommandWithUsernameSearch(command, params?.username)
        
        /**
         * Validate if username exist and unique
         */
        if (!validation.result) {
            await this.bot.sendMessage(Number(userFrom.getTgId()), validation.message);
            return;
        }

        /**
         * Check if userTo entity is not undefined
         */
        if (typeof validation.userTo === 'undefined') {
            throw new Error(`Property userTo is undefined after validation`);
        }

        const userTo = validation.userTo;
        const userToData = userTo.getData();
        const userFromData = userFrom.getData();

        /**
         * Check if command about changing user's role
         */
        if ([
            Command.revokeAccess, 
            Command.grantAccess,
            Command.makeAdmin,
            Command.removeAdmin, 
        ].includes(command)) {
            const updatingResult = await RolesHandler.updateUserRole(userFrom, userTo, command);
            let replyText;

            if (!updatingResult.result) {
                replyText = updatingResult.message;
            } else {
                replyText = `Пользователь уже имеет роль ${userToData.role}.`
                if (updatingResult.updated) {
                    if (successFromAnswer) {
                        replyText = successFromAnswer.replace('username', userToData.username ?? '');
                    }
                    if (successToAnswer) {
                        await this.bot.sendMessage(userToData.tgId, successToAnswer)
                    }
                }
            }
            await this.bot.sendMessage(userFromData.tgId, replyText)
            return;
        }

        /**
         * Check if command is about changing amount of tokens
         */
        if ([
            Command.addTokens, 
            Command.takeTokens
        ].includes(command)) {
            if (typeof params?.tokens === 'undefined') {
                await this.bot.sendMessage(userFromData.tgId, `Необходимо указать количество токенов.`);
                return;
            }

            let tokens = Number(params.tokens)
            if (command === Command.takeTokens) {
                tokens *= -1;
            }

            const currentTokens = Number(userToData.tokensAvailable)
            const totalTokens = currentTokens + tokens >= 0 ? currentTokens + tokens : 0

            await userTo.update({
                tokensAvailable: totalTokens
            })

            if (successFromAnswer) {
                const replyFromText = successFromAnswer
                                            .replace('username', userToData.username ?? '')
                                            .replace('tokens', String(Math.abs(tokens)))
                                            .replace('tokensTotal', String(totalTokens))
                await this.bot.sendMessage(userFromData.tgId, replyFromText);
            }
            if (successToAnswer) {
                const replyToText = successToAnswer
                                            .replace('tokens', String(Math.abs(tokens)))
                                            .replace('tokensTotal', String(totalTokens))
                await this.bot.sendMessage(userToData.tgId, replyToText)
            }

            const historyService = new HistoryService();
            historyService.create({
                type: HistoryRecordType.TOKENS_CHANGED,
                userId: userFrom.getTgId(),
                data: {
                    userToId: userToData.tgId,
                    tokens: tokens,
                },
            });

            return;
        }
    }

    /**
     * Validate if provided username is incorrect or not unique
     */
    private async validateCommandWithUsernameSearch(
        command: Command, 
        username?: string,
    ): Promise<UsernameValidationResult> {
        /**
         * Check if command is handable by this function
         */
        if (![
            Command.grantAccess, 
            Command.revokeAccess, 
            Command.makeAdmin, 
            Command.removeAdmin,
            Command.addTokens, 
            Command.takeTokens,
        ].includes(command)) {
            throw new Error(`CommandsHandler.handleCommandWithUsernameSearch() cannot handle command ${command}`)
        }

        /**
         * Check if username is correct
         */
        if (typeof username === 'undefined' || username.length === 0) {
            return {
                result: false,
                message: "Повторите команду с указанием юзернейма пользователя через пробел без символа '@'."
            }
        }

        const userService = new UserService()
        const usersData = await userService.findByUsername(username);

        /**
         * Check if user for given data is unique
         */
        if (usersData.length === 0) {
            return {
                result: false,
                message: `Пользователь @${username} не найден в базе. Для того, чтобы пользователю можно было выдать доступ, он должен отправить боту команду /start`
            }

        } else if (usersData.length > 1) {
            const usernames = usersData.map(user => user.username)
            return {
                result: false,
                message: `По данному юзернейму найдено несколько пользователей: ${usernames.join(', ')}. Выберите пользователя, которому нужно дать доступ и повторите команду с его юзернеймом`
            }
        }

        return {
            result: true,
            message: 'Пользователь успешно найден',
            userTo: new User(usersData[0]),
        }
    }

    async handleApiTokenCommand(command: Command, from: User, params?: CommandParams) {
        const apiTokenService = new ApiTokenService();

        if (command === Command.getApiTokens) {
            const where = 
                typeof params?.apiTokenType === 'undefined' || params?.apiTokenType === ApiTokenType.ALL 
                ? undefined 
                : { type: params?.apiTokenType }
            const apiKeys = await apiTokenService.findAll(where);
            await this.bot.sendMessage(from.getTgId(), JSON.stringify(apiKeys));
        }
        
        if (command === Command.addApiToken) {
            const token: ApiTokenData = {
                type: params?.apiTokenType?.toLowerCase() as ApiTokenType,
                token: params?.apiToken,
                usages: 0,
                isWorking: true,
                lastUsageTimestamp: 0,
            }
            const res = await apiTokenService.create(token);
            await this.bot.sendMessage(from.getTgId(), `API токен добавлен: ${JSON.stringify(res)}`);
        }

        if (command === Command.deleteApiToken) {
            const res = await apiTokenService.delete({ token: params?.apiToken });
            await this.bot.sendMessage(from.getTgId(), `API токен удален: ${params?.apiToken}`);
        }
    }
}