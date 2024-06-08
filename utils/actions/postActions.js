import { child, get, getDatabase, onValue, push, ref, remove, update } from "firebase/database";
import uuid from 'react-native-uuid';
import { getFirebaseApp } from "../firebaseHelper";

export const createPost = async (loggedInUserId, postTitle, postText, image, document) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    
    // Create a new post reference with a push operation to get the unique key
    const newPostRef = push(child(dbRef, 'posts'));
    const postId = newPostRef.key;
    
    // Create the new post data including the postId
    const newPostData = {
        postId: postId,
        createdBy: loggedInUserId,
        updatedBy: loggedInUserId,
        title: postTitle,
        text: postText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        invitationCode: generateInvitationLink(),
        imageUrl: image,
        docUrl: document,
    };

    // Update the new post data to the database reference
    await update(newPostRef, newPostData);

    return postId;
};

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

export const updatePostImagesAndDocs = async (postId, updatedImages, updatedDocs) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));

    // Construct updated post data
    const updatedData = {};
    if (updatedImages.length > 0) {
        updatedData['images'] = updatedImages;
    }
    if (updatedDocs.length > 0) {
        updatedData['docs'] = updatedDocs;
    }

    // Update the post data in the database
    await update(child(dbRef, `posts/${postId}`), updatedData);
};

// Function to delete an image from storage
export const deleteImageFromStorage = async (imageUrl) => {
    const imageRef = storage.refFromURL(imageUrl);
    await imageRef.delete();
};

// Function to delete a document from storage
export const deleteDocumentFromStorage = async (docUrl) => {
    const docRef = storage.refFromURL(docUrl);
    await docRef.delete();
};

export const getPostCreatorName = async (userId) => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const snapshot = await get(child(dbRef, `users/${userId}`));
    console.log(userId);
    if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.firstLast;
    } else {
        return null;
    }


}