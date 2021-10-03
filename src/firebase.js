import { initializeApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// firebase init - add your own config here
import firebaseConfig from './firebaseConfig.json';

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

// utils
const db = null;//firebase.db;

// collection references
const profilesCollection = null;//db.collection('profiles')

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
  db,
  resetPasswordInGoogle,
  createUserInGoogle,
  getCurrentUser,
  signIntoGoogle,
  signOutOfGoogle,
  profilesCollection,
};