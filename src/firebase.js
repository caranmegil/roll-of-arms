import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
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
        auth = getAuth();
        const user = auth.currentUser;
        const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
        const result = await set(collectionNameUserRef, data);
        return await result.then(() => true ).catch(() => false)
    } catch (e) {
        return false;
    }
};

const getCollection = async (collectionName) => {
    try {
        auth = getAuth();
        const user = auth.currentUser;
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
        const auth = getAuth();
        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: 'https://roll-of-arms.web.app',
            // This must be true.
            handleCodeInApp: true,
        };

        console.log(email, password);
        await createUserWithEmailAndPassword(auth, email, password);
        sendSignInLinkToEmail(auth, email, actionCodeSettings);

        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const signIntoGoogle = async (email, password) => {
    try {
        auth = getAuth();
        if (user == null) {
            user = auth.currentUser;
            if (user != null) {
                return user;
            }
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        return user;
    } catch (e) {
        console.error(e);
        return null;
    }
};

const isVerifyEmailWithLink = async () => {
    auth = getAuth();
    return isSignInWithEmailLink(auth, window.location.href);
};

const verifyEmailwithLink = async (email) => {
    auth = getAuth();
    if ( isSignInWithEmailLink(auth, window.location.href) ) {
        return signInWithEmailLink(auth, email, window.location.href);
    } else {
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
  isVerifyEmailWithLink,
  verifyEmailwithLink,
  signIntoGoogle,
  signOutOfGoogle,
};