import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import GroupItem from "../components/GroupItem";
import UserPreview from "../components/UserPreview";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import colors from "../constants/colors";
import {
  addAdmin,
  addUsersToChat,
  isAdmin,
  removeUserFromChat,
  updateChatData,
} from "../utils/actions/chatActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";
import * as Clipboard from "expo-clipboard";

const ChatSettingsScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const chatId = props.route.params.chatId;
  const chatData = useSelector((state) => state.chats.chatsData[chatId] || {});
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId] ?? {}
  );
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [selectedUser, setSelectedUser] = useState();

  const initialState = {
    inputValues: { chatName: chatData.chatName },
    inputValidities: { chatName: undefined },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  
  const handleGroupItemPress = async (user) => {
    setSelectedUser(user);
    setShowUserPreview(true);
    //const isGroupAdmin = await isAdmin(user, chatData);
    //console.log("break");
  };
  const handleGroupItemClose= () => {
    setSelectedUser(null);
    setShowUserPreview(false);
  };
  
  const selectedUsers = props.route.params && props.route.params.selectedUsers;
  useEffect(() => {
    if (!selectedUsers) {
      return;
    }

    const selectedUserData = [];
    selectedUsers.forEach((uid) => {
      if (uid === userData.userId) return;

      if (!storedUsers[uid]) {
        console.log("No user data found in the data store");
        return;
      }

      selectedUserData.push(storedUsers[uid]);
    });

    addUsersToChat(userData, selectedUserData, chatData);
  }, [selectedUsers]);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const shareInvitationLink = () => {
    return `https://campusconnect.com/join-chat/${chatData.invitationCode}`;
  };
  const invitationLink = shareInvitationLink();

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };
  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      setIsLoading(true);
      await updateChatData(chatId, userData.userId, updatedValues);

      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 1500);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return currentValues.chatName != chatData.chatName;
  };

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, userData, chatData);
      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  if (!chatData.users) return null;

  return (
    <PageContainer>
      <PageTitle text="Chat Settings" />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage
          showEditButton={true}
          size={80}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData.chatImage}
        />

        <Input
          id="chatName"
          label="Chat name"
          autoCapitalize="none"
          initialValue={chatData.chatName}
          allowEmpty={false}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["chatName"]}
        />
        {showSuccessMessage && <Text>Saved!</Text>}

        {isLoading ? (
          <ActivityIndicator size={"small"} color={colors.primary} />
        ) : (
          hasChanges() && (
            <SubmitButton
              title="Save changes"
              color={colors.primary}
              onPress={saveHandler}
              disabled={!formState.formIsValid}
            />
          )
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>Inviting Link</Text>
          <Text
            style={styles.link}
            onPress={() => copyToClipboard(invitationLink)}
          >
            {shareInvitationLink()}
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} Participants
          </Text>

          <DataItem
            title="Add users"
            icon="plus"
            type="button"
            onPress={() =>
              props.navigation.navigate("NewChat", {
                isGroupChat: true,
                existingUsers: chatData.users,
                chatId,
              })
            }
          />

          {chatData.users.slice(0, 4).map((uid) => {
            const currentUser = storedUsers[uid];
            return (
              <View>
                {
                  <GroupItem
                    key={uid}
                    image={currentUser.profilePicture}
                    title={`${currentUser.firstName} ${currentUser.lastName}`}
                    subTitle={currentUser.about}
                    type={uid !== userData.userId ? "link" : undefined}
                    onPress={() => handleGroupItemPress(currentUser)}
                  />
                }

                {
                  showUserPreview && selectedUser &&  selectedUser.userId !== userData.userId && selectedUser.userId === uid && (
                  <UserPreview
                    key={uid-"preview"}
                    userData={currentUser}
                    chatData={chatData}
                    onPressInfo={() =>
                      props.navigation.navigate("Contact", { uid , chatId })
                    }
                    onPressMakeAdmin={() => addAdmin(currentUser, chatData)}
                    onPressRemove={() => removeUserFromChat(userData, currentUser, chatData)}
                    onClose={() => handleGroupItemClose()}
                  />)
                }
              </View>
            );
          })}

          {chatData.users.length > 4 && (
            <GroupItem
              type={"link"}
              title="View all"
              hideImage={true}
              onPress={() =>
                props.navigation.navigate("DataList", {
                  title: "Participants",
                  data: chatData.users,
                  type: "users",
                  chatId,
                  chatData
                })
              }
            />
          )}
        </View>

        <GroupItem
          type={"link"}
          title="Starred messages"
          hideImage={true}
          onPress={() =>
            props.navigation.navigate("DataList", {
              title: "Starred messages",
              data: Object.values(starredMessages),
              type: "messages",
            })
          }
        />
      </ScrollView>

      {
        <SubmitButton
          title="Leave chat"
          color={colors.red}
          onPress={() => leaveChat()}
          style={{ marginBottom: 20 }}
        />
      }
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: colors.textColor,
    fontFamily: "bold",
    letterSpacing: 0.3,
  },
  link: {
    color: colors.blue,
    fontFamily: "regular",
    letterSpacing: 0.3,
    textDecorationLine: "underline",
  },
});

export default ChatSettingsScreen;