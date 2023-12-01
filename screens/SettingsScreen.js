import React, { useCallback, useReducer, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PageTitle from "../components/PageTitle.js";
import PageContainer from "../components/PageContainer";
import { Feather, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { validateInput } from "../utils/actions/formActions.js";
import { reducer } from "../utils/reducers/formReducer.js";
import Input from "../components/Input.js";
import { useDispatch, useSelector } from "react-redux";
import SubmitButton from "../components/SubmitButton.js";
import colors from "../constants/colors.js";
import {
  updateSignedInUserData,
  userLogout,
} from "../utils/actions/authActions.js";
import { updateLoggedInUserData } from "../store/authSlice.js";
import ProfileImage from "../components/ProfileImage.js";

const SettingsScreen = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setshowSuccessMessage] = useState(false);

  const userData =  useSelector((state) => state.auth.userData);

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const studentNumber = userData.studentNumber || "";
  const email = userData.email || "";
  const about = userData.about || "";

  const initialState = {
    inputValues: {
      firstName,
      lastName,
      studentNumber,
      email,
      about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      studentNumber: undefined,
      email: undefined,
      about: undefined,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;
    try {
      setIsLoading(true);
      await updateSignedInUserData(userData.userId, updatedValues);
      dispatch(updateLoggedInUserData({ newData: updatedValues }));
      setshowSuccessMessage(true);
      setTimeout(() => {
        setshowSuccessMessage(false);
      }, 2000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return (
      currentValues.firstName != firstName ||
      currentValues.lastName != lastName ||
      currentValues.studentNumber != studentNumber ||
      currentValues.email != email ||
      currentValues.about != about
    );
  };

  return (
    <PageContainer style={styles.container}>
      <PageTitle text="Settings" />

      <ScrollView contentContainerStyle={styles.formContainer} >
        <ProfileImage 
        size={80} 
        userId={userData.userId}
        uri ={userData.profilePicture}
        showEditButton={true} />
        <Input
          id="firstName"
          label="First name"
          icon="user-o"
          iconPack={FontAwesome}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["firstName"]}
          initialValue={userData.firstName}
        />

        <Input
          id="lastName"
          label="Last name"
          icon="user-o"
          iconPack={FontAwesome}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["lastName"]}
          initialValue={userData.lastName}
        />

        <Input
          id="studentNumber"
          label="Student Number"
          icon="university"
          iconPack={FontAwesome5}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["studentNumber"]}
          initialValue={userData.studentNumber}
        />

        <Input
          id="email"
          label="Email"
          icon="mail"
          iconPack={Feather}
          onInputChanged={inputChangedHandler}
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={formState.inputValidities["email"]}
          initialValue={userData.email}
        />

        <Input
          id="about"
          label="About"
          icon="user-o"
          iconPack={FontAwesome}
          onInputChanged={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities["about"]}
          initialValue={userData.about}
        />

        <View style={{ marginTop: 20 }}>
          {showSuccessMessage && <Text>Saved!</Text>}

          {isLoading ? (
            <ActivityIndicator
              size={"small"}
              color={colors.primary}
              style={{ marginTop: 10 }}
            />
          ) : (
            hasChanges() && (
              <SubmitButton
                title="Save"
                onPress={saveHandler}
                style={{ marginTop: 20 }}
                disabled={!formState.formIsValid}
              />
            )
          )}
        </View>
        <SubmitButton
          title="Logout"
          onPress={() => dispatch(userLogout())}
          style={{ marginTop: 20 }}
          color={colors.red}
        />
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    alignItems: "center"
  }
})

export default SettingsScreen;
