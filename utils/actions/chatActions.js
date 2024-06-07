import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import uuid from "react-native-uuid";
import { getFirebaseApp } from "../firebaseHelper.js";
import { getUserPushTokens } from "./authActions.js";
import { addUserChat } from "./userActions.js";

export const createChat = async (loggedInUserId, chatData) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  // Generate a new key for the chat
  const newChatRef = push(child(dbRef, "chats"));
  const newChatKey = newChatRef.key;

  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    invitationCode: generateInvitationLink(),
    admins: [loggedInUserId],
    chatId: newChatKey, // Assign the generated key to chatId
  };

  // Push the new chat data to the database using the generated key
  await update(newChatRef, newChatData);

  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await update(child(dbRef, `userChats/${userId}`), { [newChatKey]: true });
  }

  return newChatKey;
};

export const sendTextMessage = async (
  chatId,
  senderData,
  messageText,
  replyTo,
  chatUsers
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    messageText,
    null,
    null,
    replyTo,
    null
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    messageText,
    chatId
  );
};

export const sendInfoMessage = async (chatId, senderId, messageText) => {
  await sendMessage(chatId, senderId, messageText, null, null, null, "info");
};

export const sendImage = async (
  chatId,
  senderData,
  imageUrl,
  replyTo,
  chatUsers
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    "Image",
    imageUrl,
    null,
    replyTo,
    null
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} sent an image`,
    chatId
  );
};

export const sendDocument = async (
  chatId,
  senderData,
  documentUrl,
  replyTo,
  chatUsers,
  documentName
) => {
  await sendMessage(
    chatId,
    senderData.userId,
    documentName,
    null,
    documentUrl,
    replyTo,
    null
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  await sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} sent a document`,
    chatId
  );
};

export const updateChatData = async (chatId, userId, chatData) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${chatId}`);

  await update(chatRef, {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  });
};

export const updateUserChat = async (userId, chatId, isValid) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const userChatsRef = child(dbRef, `userChats/${userId}/${chatId}`);
    await set(userChatsRef, { [chatId]: isValid });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUserChat = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    await deleteAllMessages(userId, chatId);

    const userChatsRef = child(dbRef, `userChats/${userId}`);
    if (userChatsRef) {
      await update(userChatsRef, { [chatId]: false });
    }
    
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const sendMessage = async (
  chatId,
  senderId,
  messageText,
  imageUrl,
  documentUrl,
  replyTo,
  type
) => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);
  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };
  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  if (documentUrl) {
    messageData.documentUrl = documentUrl;
  }

  if (type) {
    messageData.type = type;
  }

  const newMessageRef = await push(messagesRef, messageData);
  const messageId = newMessageRef.key;

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });

  const chatSnapshot = await get(chatRef);
  try {
    if (chatSnapshot) {
      const chatData = chatSnapshot.val();
      const chatMembers = chatData.users;

      for (const userId of chatMembers) {
        await update(child(dbRef, `userMessages/${userId}/${chatId}`), {
          [messageId]: true,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const starMessage = async (messageId, chatId, userId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      await remove(childRef);
    } else {
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };

      await set(childRef, starredMessageData);
    }
  } catch (error) {
    console.log(error);
  }
};
export const unStarMessage = async (messageId, chatId, userId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      await remove(childRef);
    }
  } catch (error) {
    console.log(error);
  }
};
export const lastMessage = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userMessagesRef = child(dbRef, `userMessages/${userId}/${chatId}`);

    // Fetch all user messages for the chat
    const userMessagesSnapshot = await get(userMessagesRef);

    if (userMessagesSnapshot.exists()) {
      const userMessages = userMessagesSnapshot.val();

      // Get all message IDs that are not deleted
      const validMessageIds = Object.entries(userMessages)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key);

      if (validMessageIds.length > 0) {
        // Get the last valid message ID
        const lastMessageId = validMessageIds[validMessageIds.length - 1];

        // Fetch the message text from messages node
        const messageRef = child(dbRef, `messages/${chatId}/${lastMessageId}`);
        const messageSnapshot = await get(messageRef);

        if (messageSnapshot.exists()) {
          const messageData = messageSnapshot.val();
          const lastMessageText = messageData.text;

          return lastMessageText;
        }
      }
    }

    return null; // Return null if no valid message is found
  } catch (error) {
    console.error("Error fetching last message:", error);
    return null;
  }
};

export const deleteMessageforAll = async (userId, chatId, messageId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const messageRef = child(dbRef, `messages/${chatId}/${messageId}`);

    await update(messageRef, {
      isDeleted: true,
      text: "This message was deleted",
    });
    await unStarMessage(messageId, chatId, userId);
    const latestMessageSnapshot = await get(
      child(dbRef, `messages/${chatId}`),
      {}
    );
    const chatRef = child(dbRef, `chats/${chatId}`);

    if (latestMessageSnapshot.val() !== null) {
      const latestMessageValues = Object.values(latestMessageSnapshot.val());
      await update(chatRef, {
        latestMessageText:
          latestMessageValues[latestMessageValues.length - 1].text,
      });
    } else {
      await update(chatRef, {
        latestMessageText: "",
        updatedAt: new Date().toISOString(),
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

export const deleteMessageforUser = async (userId, chatId, messageId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const messageRef = child(dbRef, `userMessages/${userId}/${chatId}`);
    await update(messageRef, { [messageId]: false });
    unStarMessage(messageId, chatId, userId);

    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

export const deleteAllMessages = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const messageRef = child(dbRef, `userMessages/${userId}/${chatId}`);
    const messageSnapshot = await get(messageRef);
    const messages = messageSnapshot.val() || {};

    await update(
      messageRef,
      Object.fromEntries(
        Object.entries(messages).map(([key, value]) => [key, false])
      )
    );

    return true;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};

export const deletingChat = async (chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const chatSnapshot = await get(child(dbRef, `chats/${chatId}`));

    const chatData = chatSnapshot.val();
    const chatUsers = chatData.users;
    const messagesRef = child(dbRef, `messages/${chatId}`);
    await remove(messagesRef);

    for (const userId of chatUsers) {
      await deleteUserChat(userId, chatId);
    }

    const chatRef = child(dbRef, `chats/${chatId}`);
    await remove(chatRef);
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
};

export const removeUserFromChat = async (
  userLoggedInData,
  userToRemoveData,
  chatData
) => {
  const userToRemoveId = userToRemoveData.userId;
  const newUsers = chatData.users.filter((uid) => uid !== userToRemoveId);
  await updateChatData(chatData.chatId, userToRemoveData.userId, {
    users: newUsers,
  });
  await removeAdmin(userToRemoveData, chatData);
  await deleteUserChat(userToRemoveId, chatData.chatId);

  const messageText =
    userLoggedInData.userId === userToRemoveData.userId
      ? `${userLoggedInData.firstName} left the chat`
      : `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

export const leaveChat = async (userData, chatData) => {
  const newUsers = chatData.users.filter((uid) => uid !== userData.userId);

  await updateChatData(chatData.key, userData.userId, {
    users: newUsers,
  });
  await removeAdmin(userData, chatData);
  await deleteUserChat(userData.userId, chatData.chatId);
  const remainingAdmins = chatData.admins.filter((uid) => uid !== userData.userId);

  if (remainingAdmins.length === 0 && newUsers.length > 0) {
    const newAdmin = newUsers[0];
    await addAdmin(newAdmin,chatData);
    
  }
  const messageText = `${userData.firstName} left the chat`;

  await sendInfoMessage(chatData.chatId, userData.userId, messageText);
};

export const addUsersToChat = async (
  userLoggedInData,
  usersToAddData,
  chatData
) => {
  const existingUsers = Object.values(chatData.users);
  const newUsers = [];

  let userAddedName = "";

  usersToAddData.forEach(async (userToAdd) => {
    const userToAddId = userToAdd.userId;

    if (existingUsers.includes(userToAddId)) return;

    newUsers.push(userToAddId);

    await addUserChat(userToAddId, chatData.key);

    userAddedName = `${userToAdd.firstName}`;
  });

  if (newUsers.length === 0) {
    return;
  }

  await updateChatData(chatData.key, userLoggedInData.userId, {
    users: existingUsers.concat(newUsers),
  });

  const moreUsersMessage =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : "";
  const messageText = `${userLoggedInData.firstName} added ${userAddedName} ${moreUsersMessage}to the chat`;
  await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
};

export const joinChat = async (userData, chatData) => {
  const existingUsers = chatData.users;
  if (existingUsers.includes(userData.userId)) return;

  await addUserChat(userData.userId, chatData.chatId);

  await updateChatData(chatData.chatId, userData.userId, {
    users: existingUsers.concat(userData.userId),
  });

  const messageText = `${userData.firstName} joined  the chat`;
  await sendInfoMessage(chatData.chatId, userData.userId, messageText);
};

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
  chatUsers.forEach(async (uid) => {
    const tokens = await getUserPushTokens(uid);

    for (const key in tokens) {
      const token = tokens[key];

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          title,
          body,
          data: { chatId },
        }),
      });
    }
  });
};

export const generateInvitationLink = () => {
  const invitationCode = uuid.v4();
  return invitationCode;
};

export const updateInvitationLink = async (chatData) => {
  try {
    const newLink = generateInvitationLink();
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const chatRef = ref(db, `chats/${chatData.chatId}`);

    await update(chatRef, { invitationCode: newLink });

    chatData.invitationCode = newLink;

    return chatData;
  } catch (error) {
    console.error("Error updating invitation link:", error);
    return null;
  }
};

export const addAdmin = async (userId, chatData) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatData.chatId}`);

    await update(chatRef, {
      admins: [...chatData.admins, userId],
    });

    console.log("Admin added successfully");
  } catch (error) {
    console.error("Error adding admin:", error.message);
  }
};

export const removeAdmin = async (userId, chatData) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatData.chatId}`);

    const updatedAdmins = chatData.admins.filter(
      (adminId) => adminId !== userId
    );
    await update(chatRef, {
      admins: updatedAdmins,
    });
  } catch (error) {
    console.log("error removing admin. ", error);
  }
};

export const isAdmin = async (userData, chatData) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatData.key}`);
    const chatSnapshot = await get(chatRef);
    const chatDataFromDB = chatSnapshot.val();
    const adminStatus = chatDataFromDB.admins.includes(userData.userId);
    return adminStatus;
  } catch (error) {
    console.log(error);
  }
};

export const isUserInChat = async (userId, chatId) => {
  if (!chatId) return;

  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatsRef = child(dbRef, `chats/${chatId}`);
    const chatSnapshot = await get(chatsRef);

    const chatDataFromDB = chatSnapshot.val();
    const inChat = chatDataFromDB.users.includes(userId);
    return inChat;
  } catch (error) {
    console.error("Error checking user in chat:", error);
  }
};

export const isUserInGroup = async (userId, invitationLink) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatsRef = child(dbRef, "chats");
    const chatSnapshot = await get(chatsRef);

    if (chatSnapshot.exists()) {
      const chatsData = chatSnapshot.val();
      const chatData = Object.values(chatsData).find(
        (chat) => chat.invitationCode === invitationLink
      );

      if (chatData) {
        const chatUsers = chatData.users;
        const isInChat = chatUsers.includes(userId);

        return { chatData, isInChat };
      } else {
        return { chatData, isInChat: false };
      }
    }
  } catch (error) {
    console.error("Error checking user in chat:", error);
    return { chatData: null, isInChat: false };
  }
};

export const fetchUserMessages = async (userId, chatId) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userMessagesRef = child(dbRef, `userMessages/${userId}/${chatId}`);

    const snapshot = await get(userMessagesRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return null;
  }
};

export const addBlock = async (userData, blockedUserData) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    await update(child(dbRef, `userBlocks/${userData.userId}`), {
      [blockedUserData.userId]: true,
    });

  } catch (error) {
    console.error("Error adding block:", error.message);
  }
};

export const removeBlock = async (userData, blockedUserData) => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    await update(child(dbRef, `userBlocks/${userData.userId}`), {
      [blockedUserData.userId]: false,
    });
  } catch (error) {
    console.log("error removing block. ", error);
  }
};


