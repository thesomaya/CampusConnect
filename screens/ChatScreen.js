import { Feather } from "@expo/vector-icons";
import { child, getDatabase, off, onValue, ref } from "firebase/database";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ActionSheet from "react-native-action-sheet";
import AwesomeAlert from "react-native-awesome-alerts";
import { SafeAreaView } from "react-native-safe-area-context";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useSelector } from "react-redux";
import backgroundImage from "../assets/images/chatbackground.png";
import Bubble from "../components/Bubble";
import CustomHeaderButton from "../components/CustomHeaderButton";
import PageContainer from "../components/PageContainer";
import ReplyTo from "../components/ReplyTo";
import colors from "../constants/colors";
import {
  createChat,
  isUserInChat,
  sendDocument,
  sendImage,
  sendTextMessage,
  updateUserChat,
} from "../utils/actions/chatActions";
import { getFirebaseApp } from "../utils/firebaseHelper.js";
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from "../utils/imagePickerHelper";
import {
  launchDocumentPicker,
  uploadDocumentAsync,
} from "../utils/launchDocumentPicker";

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState("");
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState("");
  const [tempDocUri, setTempDocUri] = useState("");
  const [tempDocName, setTempDocName] = useState("");
  const [inChat, setInChat] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const options = [
    "Cancel",
    "Photos",
    "Document",
    "Contact",
    "Location",
    "Poll",
  ];
  const cancelButtonIndex = 0;

  const flatList = useRef();
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const userBlocks = useSelector((state) => state.users.blockedUsers);
  
  const showActionSheet = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        handleActionSheetPress(buttonIndex);
      }
    );
  };

  const handleActionSheetPress = (buttonIndex) => {
    switch (buttonIndex) {
      case 1:
        pickImage();
        break;
      case 2:
        pickDocument();
        break;
      case 3:
        // Contact
        break;
      case 4:
        // Location
        break;
      case 5:
        // Poll
        break;
      default:
        // Cancel
        break;
    }
  };

  const chatMessages = useSelector((state) => {
    if (!chatId) return [];

    const chatMessagesData = state.messages.messagesData[chatId] || {};
    const filteredMessages = Object.fromEntries(
      Object.entries(chatMessagesData).filter(
        ([key, message]) => message.isValid
      )
    );

    if (!filteredMessages) return [];

    const messageList = [];
    for (const key in filteredMessages) {
      const message = filteredMessages[key];

      messageList.push({
        key,
        ...message,
      });
    }

    return messageList;
  });

  const chatData =
    (chatId && storedChats[chatId]) || props.route?.params?.newChatData || {};

  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find((uid) => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  useEffect(() => {
    if (!chatData) return;

    props.navigation.setOptions({
      headerTitle: chatData.chatName ?? getChatTitleFromName(),
      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {chatId && (
              <Item
                title="Chat settings"
                iconName="settings-outline"
                onPress={() =>
                  chatData.isGroupChat
                    ? props.navigation.navigate("ChatSettings", { chatId })
                    : props.navigation.navigate("Contact", {
                        uid: chatUsers.find((uid) => uid !== userData.userId),
                      })
                }
              />
            )}
          </HeaderButtons>
        );
      },
    });
    setChatUsers(chatData.users);
  }, [chatUsers]);

  useEffect(() => {
    const checkUser = async () => {
      setIsCreatingChat(true);
      const response = await isUserInChat(userData.userId, chatId);
      setInChat(response);
      setIsCreatingChat(false);
    };
    checkUser();
  }, [chatUsers, chatId]);

  useEffect(() => {
    if (chatId) {
      const app = getFirebaseApp();
      const dbRef = ref(getDatabase(app));
      const userChatRef = child(
        dbRef,
        `userChats/${userData.userId}/${chatId}`
      );

      const handleChatStatusChange = (snapshot) => {
        const chatStatus = snapshot.val();
        setInChat(chatStatus === true);
      };

      onValue(userChatRef, handleChatStatusChange);

      return () => {
        off(userChatRef, handleChatStatusChange);
      };
    }
  }, [chatId, userData.userId]);

  useEffect(() => {
    if (chatData.admins) {
      const result = chatData.admins.includes(userData.userId);
      setIsAdmin(result);
    }
  }, [chatData, userData]);

  const otherUserId = chatUsers.find((uid) => uid !== userData.userId);

  useEffect(() => {
    console.log("otherUserId: ", otherUserId);

    if (otherUserId) {
      const isBlocker =
        userBlocks?.[userData.userId]?.[otherUserId] === true || false;
      const isBlocked = userBlocks?.[otherUserId] === true || false;

      if (isBlocker === true || isBlocked === true) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    }
  }, [otherUserId, userBlocks]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id) {
        setIsCreatingChat(true);
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
        setIsCreatingChat(false);
      }
      if (chatId && storedChats[chatId]) {
        if (storedChats[chatId].isValid === false) {
          storedChats[chatId].isValid = true;
          updateUserChat(userData.userId, chatId, { isValid: true });
        }
      }

      await sendTextMessage(
        id,
        userData,
        messageText,
        replyingTo && replyingTo.key,
        chatUsers
      );
      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [tempImageUri]);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [tempImageUri]);

  const pickDocument = useCallback(async () => {
    try {
      const documentInfo = await launchDocumentPicker();
      if (!documentInfo) return;

      const { name, uri } = documentInfo;

      setTempDocUri(uri);
      setTempDocName(name);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [tempDocUri, tempDocName]);

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(
        id,
        userData,
        uploadUrl,
        replyingTo && replyingTo.key,
        chatUsers
      );
      setReplyingTo(null);
      setTimeout(() => setTempImageUri(""), 100);
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [isLoading, tempImageUri, chatId]);

  const uploadDocument = useCallback(async () => {
    setIsLoading(true);

    try {
      let id = chatId;
      if (!id) {
        // No chat Id. Create the chat
        id = await createChat(userData.userId, props.route.params.newChatData);
        setChatId(id);
      }

      const uploadUrl = await uploadDocumentAsync(tempDocUri, true);
      setIsLoading(false);
      await sendDocument(
        id,
        userData,
        uploadUrl,
        replyingTo && replyingTo.key,
        chatUsers,
        tempDocName
      );
      setReplyingTo(null);
      setTempDocUri("");
      setTempDocName("");
    } catch (error) {
      console.log(error);
      console.log(error.message);
      console.log(error.stack);
    }
  }, [isLoading, tempDocUri, tempDocName, chatId]);

  return (
    <SafeAreaView edges={["right", "left", "bottom"]} style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <PageContainer style={{ backgroundColor: "transparent" }}>
          {!chatId && (
            <Bubble text="This is a new chat. Say hi!" type="system" />
          )}

          {errorBannerText !== "" && (
            <Bubble text={errorBannerText} type="error" />
          )}

          {chatId && (
            <FlatList
              ref={(ref) => (flatList.current = ref)}
              onContentSizeChange={() =>
                flatList.current.scrollToEnd({ animated: false })
              }
              onLayout={() => flatList.current.scrollToEnd({ animated: false })}
              data={chatMessages}
              renderItem={(itemData) => {
                const message = itemData.item;

                const isOwnMessage = message.sentBy === userData.userId;

                let messageType;
                if (message.type && message.type === "info") {
                  messageType = "info";
                } else if (isOwnMessage) {
                  messageType = "myMessage";
                } else {
                  messageType = "theirMessage";
                }

                const sender = message.sentBy && storedUsers[message.sentBy];
                const name = sender && `${sender.firstName} ${sender.lastName}`;

                return (
                  <Bubble
                    type={messageType}
                    text={message.text}
                    isDeleted={message.isDeleted}
                    isAdmin={chatData.isGroupChat ? isAdmin : false}
                    messageId={message.key}
                    userId={userData.userId}
                    chatId={chatId}
                    date={message.sentAt}
                    name={
                      !chatData.isGroupChat || isOwnMessage ? undefined : name
                    }
                    setReply={() => setReplyingTo(message)}
                    replyingTo={
                      message.replyTo &&
                      chatMessages.find((i) => i.key === message.replyTo)
                    }
                    imageUrl={message.imageUrl}
                    documentUrl={message.documentUrl}
                  />
                );
              }}
            />
          )}
        </PageContainer>

        {replyingTo && (
          <ReplyTo
            text={replyingTo.text}
            user={storedUsers[replyingTo.sentBy]}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      </ImageBackground>

      {((chatData.isGroupChat && ((chatId && inChat) || !chatId || isCreatingChat)) || (!chatData.isGroupChat && !isBlocked)) && (
        
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={showActionSheet}
          >
            <Feather name="plus" size={24} color={colors.blue} />
          </TouchableOpacity>

          <TextInput
            style={styles.textbox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          {messageText === "" && (
            <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
              <Feather name="camera" size={24} color={colors.blue} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={"white"} />
            </TouchableOpacity>
          )}

          <AwesomeAlert
            show={tempImageUri !== ""}
            title="Send image?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Cancel"
            confirmText="Send image"
            confirmButtonColor={colors.primary}
            cancelButtonColor={colors.red}
            titleStyle={styles.popupTitleStyle}
            onCancelPressed={() => setTempImageUri("")}
            onConfirmPressed={uploadImage}
            onDismiss={() => setTempImageUri("")}
            customView={
              <View>
                {isLoading && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {!isLoading && tempImageUri !== "" && (
                  <Image
                    source={{ uri: tempImageUri }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
              </View>
            }
          />

          <AwesomeAlert
            show={tempDocUri !== ""}
            title="Send document?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Cancel"
            confirmText="Send document"
            confirmButtonColor={colors.primary}
            cancelButtonColor={colors.red}
            titleStyle={styles.popupTitleStyle}
            onCancelPressed={() => setTempDocUri("")}
            onConfirmPressed={uploadDocument}
            onDismiss={() => setTempDocUri("")}
            customView={
              <View>
                {isLoading && (
                  <ActivityIndicator size="small" color={colors.primary} />
                )}
                {!isLoading && tempDocUri !== "" && (
                  <Image
                    source={{ uri: tempDocUri }}
                    style={{ width: 200, height: 200 }}
                  />
                )}
              </View>
            }
          />
        </View>
      )}
      {((chatData.isGroupChat && ((chatId && !inChat && !isCreatingChat))) || (!chatData.isGroupChat && isBlocked)) && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>You can't send messages.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  textbox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGrey,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 8,
  },
  popupTitleStyle: {
    fontFamily: "medium",
    letterSpacing: 0.3,
    color: colors.textColor,
  },
  text: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    fontFamily: "medium",
  },
});

export default ChatScreen;
