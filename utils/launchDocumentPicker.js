import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { getFirebaseApp } from './firebaseHelper';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import uuid from 'react-native-uuid';

export const launchDocumentPicker = async () => {
    await checkMediaPermissions();
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // Allow any file type, you can customize it based on your needs
    });
  
    if (!result.canceled) {
      const { name, uri } = result.assets[0];
      return { name, uri };
    } else {
      return null;
    }
  };

export const uploadDocumentAsync = async (uri) => {
  const app = getFirebaseApp();

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onerror = function (error) {
      console.log(error);
      reject(new TypeError('Network Request Failed'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send();
  });

  const storageRef = ref(getStorage(app), `documents/${uuid.v4()}`);

  await uploadBytesResumable(storageRef, blob);

  blob.close();

  return await getDownloadURL(storageRef);
};



const checkMediaPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission not granted');
      }
    } catch (error) {
      console.log('Error checking or requesting permissions:', error);
    }
};


