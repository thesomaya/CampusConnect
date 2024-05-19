import { child, getDatabase, onValue, push, ref } from "firebase/database";
import uuid from 'react-native-uuid';
import { getFirebaseApp } from "../firebaseHelper";

export const createPost = async (loggedInUserId, postText, image, document) => {
    
    const newPostData = {
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        text: postText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        invitationCode: generateInvitationLink(),
        imageUrl: image,
        docUrl: document,
    };

    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const newPost = await push(child(dbRef, 'posts'), newPostData);

    return newPost.key;
}

export const updatePost = async (postId, newData) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    await update(child(dbRef, `posts/${postId}`), newData);
};

export const deletePost = async (postId) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    await remove(child(dbRef, `posts/${postId}`));
};

export const readPostById = async (postId) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    const snapshot = await get(child(dbRef, `posts/${postId}`));
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        return null;
    }
};

export const readAllPosts = () => {
    return new Promise((resolve, reject) => {
        const app = getFirebaseApp();
        const dbRef = ref(getDatabase(app));
        const postsRef = ref(dbRef, `posts`);

        onValue(postsRef, (snapshot) => {
            const publishedPosts = snapshot.val() || {};
            resolve(publishedPosts);
        }, (error) => {
            reject(error);
        });
    });
};

export const generateInvitationLink = () => {
    const invitationCode = uuid.v4();
    return invitationCode;
}