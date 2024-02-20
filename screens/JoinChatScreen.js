import React, { useEffect, useState } from 'react';
import { Text, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Linking } from 'react-native';

const JoinChatScreen = ({ route }) => {
  const navigation = useNavigation();
  const storedChats = useSelector(state => state.chats.chatsData);
  const { invitationCode } = route.params;
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    // Implement logic to search for chatData based on the invitationCode
    const foundChatData = Object.values(storedChats).find(chat => chat.invitationCode === invitationCode);

    if (foundChatData) {
      setChatData(foundChatData);
    } else {
      console.log('Chat not found');
      navigation.goBack(); // or navigate to an error screen
    }
  }, [storedChats, invitationCode, navigation]);

  const handleCancel = () => {
    // Handle cancel action
    navigation.goBack(); // Go back to the previous screen or handle as needed
  };

  const handleJoin = () => {
    // Handle join action
    // Navigate to the ChatScreen with the obtained chatId
    navigation.navigate('ChatScreen', { chatId: chatData.chatId }); // Make sure to replace chatId with the actual key you use for the chat ID
  };

  const showJoinConfirmationAlert = () => {
    Alert.alert(
      'Join Chat',
      `Do you want to join the chat with invitation code: ${invitationCode}?`,
      [
        {
          text: 'Cancel',
          onPress: handleCancel,
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: handleJoin,
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  return (
    <>
      {chatData !== null ? (
        <>
          {showJoinConfirmationAlert()}
          {/* The rest of your component using chatData. */}
          <Image
            source={{ uri: chatData.chatImage }}
            style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 10 }}
          />
          <Text>{chatData.chatName}</Text>
          <Text>{`Joining chat with invitation code: ${invitationCode}`}</Text>
          {/* The rest of your component */}
        </>
      ) : (
        // Show loading indicator or any other UI while chatData is being fetched
        <ActivityIndicator size='large' color='blue' />
      )}
    </>
  );
};


export default JoinChatScreen;
