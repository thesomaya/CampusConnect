import { child, endAt, get, getDatabase, orderByChild, push, query, ref, remove, startAt } from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper.js";

export const getUserData = async (userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, `users/${userId}`);

        const snapshot = await get(userRef);
        return snapshot.val();
    } catch (error) {
        console.log(error);
    }
}

export const getUserChats = async (userId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, `userChats/${userId}`);

        const snapshot = await get(userRef);
        return snapshot.val();
    } catch (error) {
        console.log(error);
    }
}

export const deleteUserChat = async (userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));

        const messagesRef = child(dbRef, `userMessages/${userId}/${chatId}`);
        await remove(messagesRef);
        
        // Retrieve the unique key associated with the chatId
        const userChatsRef = child(dbRef, `userChats/${userId}`);
        const snapshot = await get(userChatsRef);

        if (snapshot.exists()) {
            const userChats = snapshot.val();
        
            // Find the unique key associated with the chatId
            const chatKey = Object.keys(userChats).find(key => userChats[key] === chatId);

            if (chatKey) {
                // Construct the reference using the unique key and remove it
                const chatRef = child(dbRef, `userChats/${userId}/${chatKey}`);
                await remove(chatRef);
            }

        } 
    } catch (error) {
            console.log(error);
            throw error;
        }
}

export const addUserChat = async (userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const chatRef = child(dbRef, `userChats/${userId}`);
        await push(chatRef, chatId);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const searchUsers = async (queryText) => {
    const searchTerm = queryText.toLowerCase();

    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const userRef = child(dbRef, 'users');

        const queryRef = query(userRef, orderByChild('firstLast'), startAt(searchTerm), endAt(searchTerm + "\uf8ff"));

        const snapshot = await get(queryRef);

        if (snapshot.exists()) {
            return snapshot.val();
        }

        return {};
    } catch (error) {
        console.log(error);
        throw error;
    }
}