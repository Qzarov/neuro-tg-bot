import { User } from "@users/domain";


/**
 * Generally field `message` is used for an answer to user.
 * The field `updated` is set to true if the entity to which 
 *  the action was directed has been changed.
 */
export interface Result {
    result: boolean;
    message: string;
    updated?: boolean;
}

export interface HasAccessResult extends Result {};
/**
 * If result === true, userTo should be not undefined
 */
export interface UsernameValidationResult extends Result {
    userTo?: User;
}