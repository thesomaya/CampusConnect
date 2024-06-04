import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-gesture-handler";
import { Swipeable } from "react-native-gesture-handler";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { useDispatch, useSelector } from "react-redux";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import colors from "../constants/colors";
import { deleteChat } from "../store/chatSlice";
import { deleteUserChat, removeUserFromChat } from "../utils/actions/chatActions";


const ChatListScreen = (props) => {
  const dispatch = useDispatch();
  const selectedUser = props.route?.params?.selectedUserId;
  const selectedUserList = props.route?.params?.selectedUsers;
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userChats = useSelector((state) => {
    const chatsData = state.chats.chatsData;
    return Object.values(chatsData).sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  });

  const chatName = props.route?.params?.chatName;

  useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
          <Item
            title="New chat"
            iconName="create-outline"
            onPress={() => props.navigation.navigate("NewChat")}
          />
        </HeaderButtons>
      ),
    });
  }, [props.navigation]);

  useEffect(() => {
    if (!selectedUser && !selectedUserList) return;

    let chatData;
    let navigationProps;

    if (selectedUser) {
      chatData = userChats.find(
        (cd) => !cd.isGroupChat && cd.users.includes(selectedUser)
      );
    }

    if (chatData) {
      navigationProps = { chatId: chatData.key };
    } else {
      const chatUsers = selectedUserList || [selectedUser];
      if (!chatUsers.includes(userData.userId)) {
        chatUsers.push(userData.userId);
      }

      navigationProps = {
        newChatData: {
          users: chatUsers,
          isGroupChat: selectedUserList !== undefined,
          isCourseChat: false,
          ...(selectedUserList && { chatName }),
        },
      };
    }

    props.navigation.navigate("ChatScreen", navigationProps);
  }, [props.navigation, props.route?.params, handleLeaveChat]);

  const handleDeleteChat = useCallback(async (chatData) => {
    if (chatData) {
      await deleteUserChat(userData.userId, chatData.chatId);
      await deleteChat();
    } else {
      console.error("Chat ID is null");
    }
  }, []);

  const handleLeaveChat = useCallback(async (chatData) => {
    if (chatData) {
      await removeUserFromChat(userData, userData, chatData);
      await deleteUserChat(userData.userId, chatData.chatId);
      await deleteChat();

    } else {
      console.error("Chat ID is null");
    }
  }, []);

  const renderSwipe = (chatData) => (
    chatData.isGroupChat ? (
      <TouchableOpacity onPress={() => handleLeaveChat(chatData)}>
        <View style={styles.deleteButton}>
          <Ionicons name="exit-outline" size={24} color="white" />
          <Text style={styles.deleteText}>Leave</Text>
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => handleDeleteChat(chatData)}>
      <View style={styles.deleteButton}>
        <AntDesign name="delete" size={20} color="white" />
        <Text style={styles.deleteText}>Delete</Text>
      </View>
    </TouchableOpacity>
    )
  );
  

  const filteredUserChats = userChats.filter((chat) => !chat.isCourseChat);
  const filteredChats = filteredUserChats.filter((chat) => chat.isValid);


  return (
    <PageContainer>
      <PageTitle text="Chats" />

      <View>
        <TouchableOpacity
          onPress={() =>
            props.navigation.navigate("NewChat", {
              isGroupChat: true,
              isCourseChat: false,
            })
          }
        >
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.key}
        renderItem={(itemData) => {
          const chatData = itemData.item;
          const chatId = chatData.key;
          const isGroupChat = chatData.isGroupChat;

          let title = "";
          const subTitle = chatData.latestMessageText || "New chat";
          let image = "";

          if (isGroupChat) {
            title = chatData.chatName;
            image = chatData.chatImage;
          } else {
            const otherUserId = chatData.users.find(
              (uid) => uid !== userData.userId
            );
            const otherUser = storedUsers[otherUserId];

            if (!otherUser) return null;

            title = `${otherUser.firstName} ${otherUser.lastName}`;
            image = otherUser.profilePicture;
          }

          return (
            <Swipeable renderRightActions={() => renderSwipe(chatData)}>
              <DataItem
                title={title}
                subTitle={subTitle}
                image={image}
                chatId={chatId}
                onPress={() =>
                  props.navigation.navigate("ChatScreen", { chatId })
                }
              />
            </Swipeable>
          );
        }}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  newGroupText: {
    color: colors.blue,
    fontSize: 17,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    padding: 10,
  },
  deleteText: {
    color: 'white',
    fontFamily: 'medium'
  },
});

export default ChatListScreen;
