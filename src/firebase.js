import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

import firebaseConfig from './firebaseConfig.json';

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// utils
const db = getDatabase(app);


// generic collection actions
const saveCollection = async (collectionName, data) => {
    const collectionNameUserRef = ref(db, collectionName + '/' + getCurrentUser().uid);
    const result = await set(collectionNameUserRef, data);
    return await result.then(() => true ).catch(() => false)
};

const getCollection = async (collectionName) => {
    try {
        const collectionNameUserRef = ref(db, collectionName + '/' + getCurrentUser().uid);
        const snapshot = await get(collectionNameUserRef)

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

const getEntireCollection = async (collectionName) => {
    try {
        const collectionNameUserRef = ref(db, collectionName);
        const snapshot = await get(collectionNameUserRef)

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (e) {
        return null;
    }
}

const createUserInGoogle = async (email, password) => {
    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (e) {
        return false;
    }
};

const signIntoGoogle = async (email, password) => {
    try {
        const auth = getAuth()
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (e) {
        return null;
    }
};

const signOutOfGoogle = async () => {
    try {
        const auth = getAuth()
        await signOut(auth);
        return true;
    } catch (e) {
        return false;
    }
};

const resetPasswordInGoogle = async (email) => {
    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (e) {
        return false;
    }
}

const getCurrentUser = () => {
    const auth = getAuth();
    return auth.currentUser;
}

// export utils/refs
export {
  app,
  analytics,
  saveCollection,
  getCollection,
  getEntireCollection,
  resetPasswordInGoogle,
  createUserInGoogle,
  getCurrentUser,
  signIntoGoogle,
  signOutOfGoogle,
};