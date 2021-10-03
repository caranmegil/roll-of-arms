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
let auth = null;
let user = null;
// utils
const db = getDatabase(app);


// generic collection actions
const saveCollection = async (collectionName, data) => {
    try {
        const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
        const result = await set(collectionNameUserRef, data);
        return await result.then(() => true ).catch(() => false)
    } catch (e) {
        return false;
    }
};

const getCollection = async (collectionName) => {
    try {
        const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
        const snapshot = await get(collectionNameUserRef)

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    } catch (e) {
        console.error(e);
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
        console.error(e);
        return null;
    }
}

const createUserInGoogle = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const signIntoGoogle = async (email, password) => {
    try {
        if (user == null) {
            auth = getAuth();
            user = auth.currentUser;
            if (user != null) {
                console.log('flag 0', user);
                return user;
            }
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        console.log('flag user', user);
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const signOutOfGoogle = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const resetPasswordInGoogle = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const getCurrentUser = () => {
    if (user == null) {
        auth = getAuth();
    }
    user = auth.currentUser;
    return user;
}

// export utils/refs
export {
  app,
  analytics,
  getCurrentUser,
  saveCollection,
  getCollection,
  getEntireCollection,
  resetPasswordInGoogle,
  createUserInGoogle,
  signIntoGoogle,
  signOutOfGoogle,
};