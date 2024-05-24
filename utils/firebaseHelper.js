import { initializeApp } from "firebase/app";
//import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';


export const getFirebaseApp = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCgpTfdYoZ_RmXQDWVavciuAOZakbSrSFo",
        authDomain: "campusconnectdatabase.firebaseapp.com",
        databaseURL: "https://campusconnectdatabase-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "campusconnectdatabase",
        storageBucket: "campusconnectdatabase.appspot.com",
        messagingSenderId: "554769821409",
        appId: "1:554769821409:web:2226c49756e0c4ec3f91a0",
        measurementId: "G-MZ5CT0JVRY"
    };

    //const analytics = getAnalytics(app);

    return initializeApp(firebaseConfig);
    
}

const app = getFirebaseApp();

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
