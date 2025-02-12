import { Feather, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DataItem from '../components/DataItem';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import ProfileImage from '../components/ProfileImage';
import SubmitButton from '../components/SubmitButton';
import colors from '../constants/colors';
import { updateLoggedInUserData } from '../store/authSlice';
import { updateSignedInUserData, userLogout } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';

const SettingsScreen = props => {

    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const userData = useSelector(state => state.auth.userData);
    const starredMessages = useSelector(state => state.messages.starredMessages ?? {});
    

    const sortedStarredMessages = useMemo(() => {
        let result = [];

        const chats = Object.values(starredMessages);

        chats.forEach(chat => {
            const chatMessages = Object.values(chat);
            result = result.concat(chatMessages);
        })

        return result;
    }, [starredMessages]);
    
    const firstName = userData.firstName || "";
    const lastName = userData.lastName || "";
    const email = userData.email || "";
    const studentNumber = userData.studentNumber || "";
    const about = userData.about || "";
    const selectedRole = userData.selectedRole || "";

    const initialState = {
        inputValues: {
            firstName,
            lastName,
            email,
            studentNumber,
            about,
            selectedRole,
        },
        inputValidities: {
            firstName: undefined,
            lastName: undefined,
            email: undefined,
            studentNumber: undefined,
            about: undefined,
            selectedRole: undefined,
        },
        formIsValid: false
    }

    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({ inputId, validationResult: result, inputValue })
    }, [dispatchFormState]);

    const saveHandler = useCallback(async () => {
        const updatedValues = formState.inputValues;
        
        try {
            setIsLoading(true);
            await updateSignedInUserData(userData.userId, updatedValues);
            dispatch(updateLoggedInUserData({newData: updatedValues}));

            setShowSuccessMessage(true);

            setTimeout(() => {
                setShowSuccessMessage(false)
            }, 3000);
        } catch (error) {
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }
    }, [formState, dispatch]);

    const hasChanges = () => {
        const currentValues = formState.inputValues;

        return currentValues.firstName != firstName ||
            currentValues.lastName != lastName || 
            currentValues.email != email ||
            currentValues.about != about;
    }
    
    return <PageContainer>
        <PageTitle text="Settings" />

        <ScrollView contentContainerStyle={styles.formContainer}>

            <ProfileImage
                size={80}
                userId={userData.userId}
                uri={userData.profilePicture}
                showEditButton={true} 
                />

            <Input
                id="userRole"
                label="User Role"
                color="grey"
                icon="user-o"
                iconPack={FontAwesome}   
                initialValue={userData.selectedRole}
                editable={false}
                iconRight="lock"
                iconPackRight={FontAwesome}
                />

            <Input
                id="firstName"
                label="First name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["firstName"]}
                initialValue={userData.firstName} />

            <Input
                id="lastName"
                label="Last name"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["lastName"]}
                initialValue={userData.lastName} />

            <Input
                id="email"
                label="Email"
                icon="mail"
                iconPack={Feather}
                onInputChanged={inputChangedHandler}
                keyboardType="email-address"
                autoCapitalize="none"
                errorText={formState.inputValidities["email"]}
                initialValue={userData.email} />
            
            {
                userData.selectedRole === "student" &&
                <Input
                id="studentNumber"
                label="Student Number"
                icon="university"
                color="grey"
                iconPack={FontAwesome5}
                onInputChanged={inputChangedHandler}
                initialValue={userData.studentNumber}
                editable={false}
                iconRight="lock"
                iconPackRight={FontAwesome} />
            }

            <Input
                id="about"
                label="About"
                icon="user-o"
                iconPack={FontAwesome}
                onInputChanged={inputChangedHandler}
                autoCapitalize="none"
                errorText={formState.inputValidities["about"]}
                initialValue={userData.about} />

            <View style={{ marginTop: 20 }}>
                {
                    showSuccessMessage && <Text>Saved!</Text>
                }

            {
                isLoading ? 
                <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 10 }} /> :
                hasChanges() && <SubmitButton
                    title="Save"
                    onPress={saveHandler}
                    style={{ marginTop: 20 }}
                    disabled={!formState.formIsValid} />
            }
            </View>

            <DataItem
                type={"link"}
                title="Starred messages"
                hideImage={true}
                onPress={() => props.navigation.navigate("DataList", { title: "Starred messages", data: sortedStarredMessages, type: "messages" })}
            />

            <SubmitButton
                title="Logout"
                onPress={() => dispatch(userLogout(userData)) }
                style={{ marginTop: 20 }}
                color={colors.black}/>

        </ScrollView>   
    </PageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: { 
        alignItems: 'center'
    }
})

export default SettingsScreen;