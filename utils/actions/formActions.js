import { validateEmail, validateLength, validatePassword, validateString, validateStudentNumber } from '../validationConstraints';

export const validateInput = (inputId, inputValue, selectedRole) => {

    if (inputId === "firstName" || inputId === "lastName") {
        return validateString(inputId, inputValue)
    }
    else if (inputId === "email") {
        return validateEmail(inputId, inputValue, selectedRole)
    }
    else if (inputId === "password") {
        return validatePassword(inputId, inputValue)
    }
    else if (inputId === "studentNumber") {
        return selectedRole === "student" ? validateStudentNumber(inputId, inputValue, selectedRole) : undefined;

    }
    else if (inputId === "about") {
        return validateLength(inputId, inputValue, 0, 150, true)
    }
    else if (inputId === "chatName") {
        return validateLength(inputId, inputValue, 5, 50, false)
    }
}