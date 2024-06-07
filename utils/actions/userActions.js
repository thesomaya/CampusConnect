import { child, endAt, get, getDatabase, orderByChild, query, ref, startAt, update } from "firebase/database";
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
        const allChats = snapshot.val() || {};

        const validChats = {};
        for (const [chatId, isValid] of Object.entries(allChats)) {
            if (isValid) {
                validChats[chatId] = isValid;
            }
        }

        return validChats;
    } catch (error) {
        console.log(error);
        return {}; 
    }
}



export const addUserChat = async (userId, chatId) => {
    try {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        await update(child(dbRef, `userChats/${userId}`), { [chatId]: true });

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