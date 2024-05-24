import { Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';

import Input from '../components/Input';
import SubmitButton from '../components/SubmitButton';
import colors from '../constants/colors';
import { signUp } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';

const initialState = {
    inputValues: {
        firstName: "",
        lastName: "",
        studentNumber: "",
        email: "",
        password: "",
        selectedRole: "student",
    },
    inputValidities: {
        firstName: false,
        lastName: false,
        studentNumber: false,
        email: false,
        password: false,
    },
    formIsValid: false
};

const SignUpStudent = props => {
    const dispatch = useDispatch();

    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue, formState.inputValues.selectedRole);
        dispatchFormState({ type: 'FORM_INPUT_UPDATE', inputId, validationResult: result, inputValue });
    }, [formState.inputValues.selectedRole]);

    useEffect(() => {
        if (error) {
            Alert.alert("An error occurred", error, [{ text: "Okay" }]);
        }
    }, [error]);

    const authHandler = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const action = signUp(
                formState.inputValues.firstName,
                formState.inputValues.lastName,
                formState.inputValues.studentNumber,
                formState.inputValues.email,
                formState.inputValues.password,
                formState.inputValues.selectedRole,
            );
            await dispatch(action);
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    }, [dispatch, formState]);

    return (
        <>
            <Input
                id="firstName"
                label="First name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["firstName"]} />
            <Input
                id="lastName"
                label="Last name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["lastName"]} />
            {formState.inputValues.selectedRole === "student" &&
                <Input
                    id="studentNumber"
                    label="Student Number"
                    icon="university"
                    iconPack={FontAwesome5}
                    onInputChanged={inputChangedHandler}
                    errorText={formState.inputValidities["studentNumber"]} />
            }
            <Input
                id="email"
                label="Email"
                icon="mail"
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                keyboardType="email-address"
                autoCapitalize="none"
                errorText={formState.inputValidities["email"]} />
            <Input
                id="password"
                label="Password"
                icon="lock"
                autoCapitalize="none"
                secureTextEntry
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["password"]} />
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
            ) : (
                <SubmitButton
                    title="Sign up"
                    onPress={authHandler}
                    style={{ marginTop: 20 }}
                    disabled={!formState.formIsValid}
                />
            )}
        </>
    );
};

export default SignUpStudent;
