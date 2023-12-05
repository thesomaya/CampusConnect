import React, {useCallback, useEffect, useReducer, useState} from 'react';
import Input from '../components/Input';
import { Feather } from '@expo/vector-icons';
import SubmitButton from '../components/SubmitButton';
import { validateInput } from '../utils/actions/formActions.js';
import { reducer } from '../utils/reducers/formReducer';
import { ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { signIn } from '../utils/actions/authActions';
import colors from '../constants/colors.js';

const isTestMode = true;

const initialState = {
    inputValues: {     
        email: isTestMode ? "somaia@example.com": "",
        password: isTestMode ? "asdfghjkl" : "",
    },
    inputValidities: {
        email: isTestMode,
        password: isTestMode,
    },
    formIsValid: isTestMode
}

const SignInForm = props => {
    const dispatch = useDispatch();

    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false); // For Latency so that sign up doesn't get pressed twice

    const [formState, dispatchFormState] = useReducer(reducer,initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId,inputValue,null);
        dispatchFormState({ inputId, validationResult: result, inputValue});

    } , [dispatchFormState]) ;

    useEffect( () => {
        if (error) {
            Alert.alert("An error occured.", error)
        }
    }, [error])

    const authHandler = useCallback(async () => {
        try {
            setIsLoading(true);
            const action = signIn(
                formState.inputValues.email,
                formState.inputValues.password,
            );
            setError(null);
            await dispatch(action);    
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    },[dispatch, formState]);

    return (
        <>
                <Input 
                id = "email"
                label="University email" 
                icon="mail"
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                autoCapitalized="none"
                keyboardType="email-address"
                initialValue={formState.inputValues.email}
                errorText={formState.inputValidities["email"]} />

                <Input 
                id = "password"
                label="Password" 
                icon="lock"
                autoCapitalized="none"
                secureTextEntry
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                initialValue={formState.inputValues.password}
                errorText={formState.inputValidities["password"]}
                 />

                {
                    isLoading ? 
                    <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
                    <SubmitButton
                        title="Sign In"
                        onPress={authHandler}
                        style={{ marginTop: 20 }}
                        disabled={!formState.formIsValid}/>
                }

        </>
    )
};

export default SignInForm;