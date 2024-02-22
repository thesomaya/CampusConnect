import { child, get, getDatabase, push, ref, remove, set, update } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";
import { getUserPushTokens } from "./authActions";
import { addUserChat, deleteUserChat, getUserChats } from "./userActions";
import uuid from 'react-native-uuid';

export const createChat = async (loggedInUserId, chatData) => {
    
    const newChatData = {
        ...chatData,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        invitationCode: generateInvitationLink(),
        admins: [loggedInUserId],
    };

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const newChat = await push(child(dbRef, 'chats'), newChatData);

    const chatUsers = newChatData.users;
    for (let i = 0; i < chatUsers.length; i++) {
        const userId = chatUsers[i];
        await push(child(dbRef, `userChats/${userId}`), newChat.key);        
    }

    return newChat.key;
}

export const sendTextMessage = async (chatId, senderData, messageText, replyTo, chatUsers) => {
    await sendMessage(chatId, senderData.userId, messageText, null, null, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, messageText, chatId);
}

export const sendInfoMessage = async (chatId, senderId, messageText) => {
    await sendMessage(chatId, senderId, messageText, null, null, null, "info");
}

export const sendImage = async (chatId, senderData, imageUrl, replyTo, chatUsers) => {
    await sendMessage(chatId, senderData.userId, 'Image', imageUrl, null, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, `${senderData.firstName} sent an image`, chatId);
}

export const sendDocument = async (chatId, senderData, documentUrl, replyTo, chatUsers, documentName) => {
    await sendMessage(chatId, senderData.userId, documentName, null, documentUrl, replyTo, null);

    const otherUsers = chatUsers.filter(uid => uid !== senderData.userId);
    await sendPushNotificationForUsers(otherUsers, `${senderData.firstName} ${senderData.lastName}`, `${senderData.firstName} sent a document`, chatId);
}

export const updateChatData = async (chatId, userId, chatData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    await update(chatRef, {
        ...chatData,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
    })
}

const sendMessage = async (chatId, senderId, messageText, imageUrl, documentUrl, replyTo, type) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase());
    const messagesRef = child(dbRef, `messages/${chatId}`);
    const messageData = {
        sentBy: senderId,
        sentAt: new Date().toISOString(),
        text: messageText
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

    await push(messagesRef, messageData);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestMessageText: messageText
    });
}

export const starMessage = async (messageId, chatId, userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const childRef = child(dbRef, `userStarredMessages/${userId}/${chatId}/${messageId}`);

        const snapshot = await get(childRef);

        if (snapshot.exists()) {
            // Starred item exists - Un-star
            await remove(childRef);
        }
        else {
            // Starred item does not exist - star
            const starredMessageData = {
                messageId,
                chatId,
                starredAt: new Date().toISOString()
            }

            await set(childRef, starredMessageData);
        }
    } catch (error) {
        console.log(error);   
        
    }
}

export const deleteMessage = async (chatId, messageId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const messageRef = child(dbRef, `messages/${chatId}/${messageId}`);

        await remove(messageRef);

        const latestMessageSnapshot = await get(child(dbRef, `messages/${chatId}`), {});
        const chatRef = child(dbRef, `chats/${chatId}`);
        
        if (latestMessageSnapshot.val() !== null) {
            const latestMessageValues = Object.values(latestMessageSnapshot.val());
            await update(chatRef, {
                latestMessageText: latestMessageValues[latestMessageValues.length - 1].text,
            });
        } else {
            await update(chatRef, {
                latestMessageText: '',
                updatedAt: new Date().toISOString(),
            });
        }

        return true;
    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
};

export const deletingChat = async (chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));

        // Get the chat data to obtain the list of users
        const chatSnapshot = await get(child(dbRef, `chats/${chatId}`));

        const chatData = chatSnapshot.val();
        const chatUsers = chatData.users;
        // Delete all messages in the chat
        const messagesRef = child(dbRef, `messages/${chatId}`);
        await remove(messagesRef);

        // Remove the chat from userChats for each user
        for (const userId of chatUsers) {
            await deleteUserChat(userId, chatId);
        }

        // Remove the chat reference 
        const chatRef = child(dbRef, `chats/${chatId}`);
        await remove(chatRef);
        return true;
    } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
    }
};

export const removeUserFromChat = async (userLoggedInData, userToRemoveData, chatData) => {
    const userToRemoveId = userToRemoveData.userId;
    const newUsers = chatData.users.filter(uid => uid !== userToRemoveId);
    await updateChatData(chatData.key, userLoggedInData.userId, { users: newUsers });

    const userChats = await getUserChats(userToRemoveId);

    for (const key in userChats) {
        const currentChatId = userChats[key];

        if (currentChatId === chatData.key) {
            await deleteUserChat(userToRemoveId, key);
            break;
        }
    }

    const messageText = userLoggedInData.userId === userToRemoveData.userId ?
        `${userLoggedInData.firstName} left the chat` :
        `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

    await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);
}

export const addUsersToChat = async (userLoggedInData, usersToAddData, chatData) => {
    const existingUsers = Object.values(chatData.users);
    const newUsers = [];

    let userAddedName = "";

    usersToAddData.forEach(async userToAdd => {
        const userToAddId = userToAdd.userId;

        if (existingUsers.includes(userToAddId)) return;

        newUsers.push(userToAddId);

        await addUserChat(userToAddId, chatData.key);

        userAddedName = `${userToAdd.firstName}`;
    });

    if (newUsers.length === 0) {
        return;
    }

    await updateChatData(chatData.key, userLoggedInData.userId, { users: existingUsers.concat(newUsers) })

    const moreUsersMessage = newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : '';
    const messageText = `${userLoggedInData.firstName} added ${userAddedName} ${moreUsersMessage}to the chat`;
    await sendInfoMessage(chatData.key, userLoggedInData.userId, messageText);

}

const sendPushNotificationForUsers = (chatUsers, title, body, chatId) => {
    chatUsers.forEach(async uid => {
        const tokens = await getUserPushTokens(uid);

        for(const key in tokens) {
            const token = tokens[key];

            await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: token,
                    title,
                    body,
                    data: { chatId }
                })
            })
        }
    })
}

export const generateInvitationLink = () => {
    const invitationCode = uuid.v4();
    return invitationCode;
}

export const addAdmin = async (chatId, userId) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    await update(chatRef, {
        admins: [...chatData.admins, userId]
    });
}

export const removeAdmin = async (chatId, userId) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const chatRef = child(dbRef, `chats/${chatId}`);

    const updatedAdmins = chatData.admins.filter(adminId => adminId !== userId);
    await update(chatRef, {
        admins: updatedAdmins
    });
}

