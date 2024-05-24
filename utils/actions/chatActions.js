import { child, get, getDatabase, push, ref, remove, set, update } from "firebase/database";
import uuid from 'react-native-uuid';
import { getFirebaseApp } from "../firebaseHelper.js";
import { getUserPushTokens } from "./authActions.js";
import { addUserChat, deleteUserChat, getUserChats } from "./userActions.js";

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

    const newMessageRef = await push(messagesRef, messageData);
    const messageId = newMessageRef.key;
    console.log("the message id ", messageId);

    const chatRef = child(dbRef, `chats/${chatId}`);
    await update(chatRef, {
        updatedBy: senderId,
        updatedAt: new Date().toISOString(),
        latestMessageText: messageText
    });

    const chatSnapshot = await get(chatRef);
    try {
        if (chatSnapshot) {
            const chatData = chatSnapshot.val();
            const chatMembers = chatData.users;
    
        for (const userId of chatMembers) {
            await update(child(dbRef, `userMessages/${userId}/${chatId}`), {[messageId]:true});
        }
        }
    } catch (error) {
        console.log(error);
    }
    
}

export const starMessage = async (messageId, chatId, userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const childRef = child(dbRef, `userStarredMessages/${userId}/${chatId}/${messageId}`);

        const snapshot = await get(childRef);

        if (snapshot.exists()) {
            await remove(childRef);
        }
        else {
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

export const deleteMessageforUser = async (userId, chatId, messageId) => {
    console.log("userId: ", userId, " chatid: ", chatId, " message id : ", messageId);
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const messageRef = child(dbRef, `userMessages/${userId}/${chatId}/${messageId}`);

        await remove(messageRef);

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

export const addAdmin = async (userData, chatData) => {
    
    try {
        const app = getFirebaseApp(); // Assuming getFirebaseApp is defined somewhere
        const dbRef = ref(getDatabase(app));
        const chatRef = child(dbRef, `chats/${chatData.key}`);
        
        await update(chatRef, {
            admins: [...chatData.admins, userData.userId]
        });

        console.log("Admin added successfully");
    } catch (error) {
        console.error("Error adding admin:", error.message);
    }
};

export const removeAdmin = async (userData, chatData) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatRef = child(dbRef, `chats/${chatData.key}`);

        const updatedAdmins = chatData.admins.filter(adminId => adminId !== userData.userId);
        await update(chatRef, {
            admins: updatedAdmins
        });
    } catch (error) {
        console.log("error removing admin. ", error);
    }
    
}

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
    
}

export const isUserInChat = async (userId, chatId) => {
    if(!chatId) return;
    
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatsRef = child(dbRef, `chats/${chatId}`);
        const chatSnapshot = await get(chatsRef);

        const chatDataFromDB = chatSnapshot.val();
        const inChat = chatDataFromDB.users.includes(userId);
        return inChat;
    } catch (error) {
        console.error('Error checking user in chat:', error);
    }
};

export const isUserInGroup = async (userId, invitationLink) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatsRef = child(dbRef, 'chats');
        const chatSnapshot = await get(chatsRef);

        if (chatSnapshot.exists()) {
            const chatsData = chatSnapshot.val();
            const chatId = Object.keys(chatsData).find(chatId => chatsData[chatId].invitationCode === invitationLink);

            if (chatId) {
                const chatUsers = chatsData[chatId].users;
                const isInChat = chatUsers.includes(userId);
                return { isInChat, chatId };
            } else {
                return { isInChat: false, chatId: null };
            }
        } 
    } catch (error) {
        console.error('Error checking user in chat:', error);
        return { isInChat: false, chatId: null };
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




