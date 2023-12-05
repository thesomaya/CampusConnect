import React, { useCallback, useEffect, useReducer, useState } from 'react';
import Input from '../components/Input';
import SubmitButton from '../components/SubmitButton';
import { Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { signUp } from '../utils/actions/authActions';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import colors from '../constants/colors';
import { useDispatch } from 'react-redux';

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
}

const SignUpForm = props => {

    const dispatch = useDispatch();

    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue, formState.inputValues.selectedRole);
        dispatchFormState({ inputId, validationResult: result, inputValue, selectedRole: formState.inputValues.selectedRole })
    }, [dispatchFormState, formState]);

    useEffect(() => {
        if (error) {
            Alert.alert("An error occured", error, [{ text: "Okay" }]);
        }
    }, [error])

    const authHandler = useCallback(async () => {
        try {
            const action = signUp(
                formState.inputValues.firstName,
                formState.inputValues.lastName,
                formState.inputValues.studentNumber,       
                formState.inputValues.email,
                formState.inputValues.password,
                formState.inputValues.selectedRole,
            );
            setError(null);
            await dispatch(action);
        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    }, [dispatch, formState]);

    return (   
        <>

                <View >
                    <Text style={{marginTop: -50,fontFamily: "bold", fontSize: 14}}>Select your role</Text>
                    <Picker
                        selectedValue={formState.inputValues.selectedRole}
                        itemStyle={{  fontFamily:"regular", fontSize:14, marginTop: -60, marginBottom: -40 }}
                        onValueChange={(itemValue) => inputChangedHandler("selectedRole", itemValue)}>
                        <Picker.Item label="Student" value="student" />
                        <Picker.Item label="Faculty Member" value="facultyMember" />
                        
                    
                    </Picker>   
                </View>
                
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

                
                {
                    formState.inputValues.selectedRole === "student" &&
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
                
                {
                    isLoading ? 
                    <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
                    <SubmitButton
                        title="Sign up"
                        onPress={authHandler}
                        style={{ marginTop: 20 }}
                        disabled={!formState.formIsValid}/>
                }
            </>
    )
};

export default SignUpForm;