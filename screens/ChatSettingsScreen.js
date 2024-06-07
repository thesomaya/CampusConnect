import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import DataItem from "../components/DataItem";
import GroupItem from "../components/GroupItem";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import UserPreview from "../components/UserPreview";
import colors from "../constants/colors";
import { deleteChat } from "../store/chatSlice";
import { addAdmin, addUsersToChat, isAdmin, leaveChat, removeAdmin, removeUserFromChat, updateChatData, updateInvitationLink } from "../utils/actions/chatActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducer";

const ChatSettingsScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const chatId = props.route.params.chatId;

  const chatData = useSelector((state) => state.chats.chatsData[chatId] || {});
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const starredMessages = useSelector(
    (state) => state.messages.starredMessages[chatId] ?? {}
  );
  const [showUserPreview, setShowUserPreview] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState();
  const [userAdmins, setUserAdmins] = useState({});
  const [isLoggedUserAdmin, setIsLoggedUserAdmin] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const initialState = {
    inputValues: { chatName: chatData.chatName },
    inputValidities: { chatName: undefined },
    formIsValid: false,
  };
  const handleEditStart = () => {
    setEditingUserId(userData.userId); // Update when editing starts
  };
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const handleGroupItemPress = async (user) => {
    setSelectedUser(user);
    setShowUserPreview(true);
    await checkAdminStatus(user, chatData);
  };
  useEffect(() => {
    const checkIfUserIsAdmin = async () => {
      const isUserAdmin = await isAdmin(userData, chatData);
      setIsLoggedUserAdmin(isUserAdmin);
    };

    checkIfUserIsAdmin();
  }, [userData, chatData]);

  useEffect(() => {
    if (chatData.users) {
      const handleAdminStatuses = async () => {
        const admins = {};
        for (const uid of chatData.users) {
          admins[uid] = await isAdmin(storedUsers[uid], chatData);
        }
        setUserAdmins(admins);
      };

      if (chatData.users.length) {
        handleAdminStatuses();
      }
    }
  }, [chatData.users, storedUsers]);

  const handleGroupItemClose = () => {
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
    return `exp://192.168.1.143:8081/--/joinchat/${chatData.invitationCode}`;
  };
  const invitationLink = shareInvitationLink();

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      setShowCopyMessage(true);
      setTimeout(() => {
        setShowCopyMessage(false);
      }, 3000);
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

  const leaveGroupChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await leaveChat(userData, chatData);
      await deleteChat();
      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  const removeFromChat = useCallback(async (currentUser,
    ) => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, currentUser, chatData);
      props.navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  const checkAdminStatus = async (user, chatData) => {
    const isUserAdmin = await isAdmin(user, chatData);
    setIsAdminUser(isUserAdmin);
  };

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
          editable={isLoggedUserAdmin}
          onFocus={handleEditStart}
        />
        {showSuccessMessage && <Text>Saved!</Text>}

        {isLoggedUserAdmin && 
          (isLoading ? (
            <ActivityIndicator size={"small"} color={colors.primary} />
          ) : (
            hasChanges() && isLoggedUserAdmin && editingUserId === userData.userId &&  (
              <SubmitButton
                title="Save changes"
                color={colors.primary}
                onPress={saveHandler}
                disabled={!formState.formIsValid}
              />
            )
          ))}
        {isLoggedUserAdmin && (
          <View style={styles.sectionContainer}>
            <Text style={styles.heading}>Inviting Link</Text>

            <View style={styles.linkContainer}>
              <Text
                style={styles.link}
                onPress={() => copyToClipboard(invitationLink)}
              >
                {shareInvitationLink()}
              </Text>
              <Ionicons
                name="reload"
                size={24}
                color="black"
                onPress={() => updateInvitationLink(chatData)}
              />
            </View>
          </View>
        )}
        {showCopyMessage && (
          <Text style={styles.copyMessage}>Link copied!</Text>
        )}

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

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData.users.length} Participants
          </Text>

          {isLoggedUserAdmin && (
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
          )}

          {chatData.users.map((uid) => {
            const currentUser = storedUsers[uid];
            if (!currentUser) return null;

            const currentAdmin = userAdmins[uid];
            return (
              <View key={uid}>
                {uid && (
                  <GroupItem
                    key={uid}
                    image={currentUser.profilePicture}
                    title={`${currentUser.firstName} ${currentUser.lastName}`}
                    subTitle={currentUser.about}
                    type={uid !== userData.userId ? "link" : undefined}
                    onPress={() => handleGroupItemPress(currentUser)}
                    admin={currentAdmin}
                  />
                )}

                {selectedUser &&
                  showUserPreview &&
                  selectedUser.userId !== userData.userId &&
                  selectedUser.userId === uid && (
                    <UserPreview
                      key={uid - "preview"}
                      userData={currentUser}
                      LoggedInUser={userData}
                      name={`${currentUser.firstName} ${currentUser.lastName}`}
                      image={currentUser.profilePicture}
                      chatData={chatData}
                      onPressInfo={() => {
                        props.navigation.navigate("Contact", { uid, chatId });
                        handleGroupItemClose();
                      }}
                      onPressMakeAdmin={() =>
                        isAdminUser
                          ? removeAdmin(currentUser.userId, chatData).then(() =>
                              handleGroupItemClose()
                            )
                          : addAdmin(currentUser.userId, chatData).then(() =>
                              handleGroupItemClose()
                            )
                      }
                      onPressRemove={() =>
                        removeFromChat(
                          currentUser
                        ).then(() => handleGroupItemClose())
                      }
                      onClose={() => handleGroupItemClose()}
                    />
                  )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {
        // <SubmitButton
        //   title="Leave chat"
        //   color={colors.black}
        //   onPress={() => leaveGroupChat()}
        //   style={{ width: "40%", alignSelf: "center", marginBottom: 20 }}
        // />
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
    borderBottomWidth: 0.5,
    paddingBottom: 5,
    borderColor: colors.extraLightGrey,
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
    marginBottom: 5,
  },
  copyMessage: {
    color: colors.primary,
    marginVertical: 8,
  },
  linkContainer: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
});

export default ChatSettingsScreen;