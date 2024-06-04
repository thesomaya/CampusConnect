import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { useSelector } from "react-redux";
import { isUserInGroup, joinChat } from "../utils/actions/chatActions.js";

const JoinChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const userData = useSelector((state) => state.auth.userData);
  const { invitationCode } = route.params;
  const [chatData, setChatData] = useState(null);
  const [userInChat, setUserInChat] = useState(null);

  JoinChatScreen.navigationOptions = ({ navigation }) => ({
    headerLeft: (
      <Ionicons name="arrow-back" size={24} color="black" onPress={() => navigation.goBack()} />
    ),
  });
  
  useEffect(() => {
    const getChatData = async () => {
      try {
        const { chatData: foundChatData, isInChat: foundUserData } = await isUserInGroup(userData.userId, invitationCode);
        
        if (foundChatData) {
          console.log("foundChatData", foundChatData);
          console.log("foundUserData", foundUserData);
          setChatData(foundChatData);
          setUserInChat(foundUserData);
        } else {
          console.log("Chat not found");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching chat data", error);
        navigation.goBack();
      }
    };
    getChatData();
  }, [invitationCode, navigation, userData.userId]);

  useEffect(() => {
    if (chatData !== null) {
      if (userInChat !== null) {
        console.log("chatData updated", chatData);
        console.log("userInChat updated", userInChat);
        if (userInChat) {
          handleNavigation();
        } else {
          showJoinConfirmationAlert();
        }
      }
    }
  }, [chatData, userInChat]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleJoin = async () => {
    console.log("Joining chat");
    if (!userInChat) {
      await joinChat(userData, chatData);
      setUserInChat(true); // Manually setting userInChat to true after joining
    }
    handleNavigation();
  };

  const handleNavigation = () => {
    navigation.replace("ChatScreen", { chatId: chatData.chatId });  
  };

  const showJoinConfirmationAlert = () => {
    Alert.alert(
      "Join Chat",
      `Do you want to join the chat: ${chatData.chatName}?`,
      [
        {
          text: "Cancel",
          onPress: handleCancel,
          style: "cancel",
        },
        {
          text: "Join",
          onPress: handleJoin,
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View>
      {/* {chatData !== null ? (
        <ActivityIndicator size='large' color='blue' />
      ) : (
        <ActivityIndicator size='large' color='blue' />
      )} */}
    </View>
  );
};

export default JoinChatScreen;
