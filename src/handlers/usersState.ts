
export enum UserState {
    start,
    usingGPT,
    usingGemini
}

class UsersStateHandler {
    private usersState: { [key: number]: UserState }

    constructor() {
        this.usersState = {}
    }

    public getCurrentState(userId: number): UserState {
        return this.usersState[userId]
    }

    public updateUserState(userId: number, newState: UserState) {
        this.usersState[userId] = newState
    }

    public isUsingNeuro(userId: number): boolean {
        const userState = this.getCurrentState(userId)
        return [UserState.usingGPT, UserState.usingGemini].includes(userState)
    }
}

const usersState = new UsersStateHandler();
export default usersState