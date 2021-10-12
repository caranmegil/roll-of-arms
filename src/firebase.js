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
    confirmPasswordReset,
    updatePassword,
} from "firebase/auth";

import { getAnalytics } from "firebase/analytics";

import firebaseConfig from './firebaseConfig.json';

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
let auth = null;
let user = null;
// utils
const db = getDatabase(app);
const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: `${location.protocol}//${location.hostname}${(location.port) ? ':' + location.port : ''}`,
    // This must be true.
    handleCodeInApp: true,
};


// generic collection actions
const saveCollectionByField = async (collectionName, fieldName, data) => {
    try {
        auth = getAuth();
        const collectionNameUserRef = ref(db, collectionName + '/' + fieldName);
        const result = await set(collectionNameUserRef, data);
        return await result.then(() => true ).catch(() => false)
    } catch (e) {
        return false;
    }
};

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

const getCollectionByField = async (collectionName, fieldName) => {
    try {
        const collectionNameUserRef = ref(db, collectionName + '/' + fieldName);
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
    const auth = getAuth();

    await createUserWithEmailAndPassword(auth, email, password);
    sendSignInLinkToEmail(auth, email, actionCodeSettings);

    return true;
};

const confirmPassword = async (authCode, password) => {
    try {
        const auth = getAuth();
        await confirmPasswordReset(auth, authCode, password);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const signIntoGoogle = async (email, password) => {
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
};

const isVerifyEmailWithLink = async () => {
    auth = getAuth();
    return isSignInWithEmailLink(auth, window.location.href);
};

const verifyEmailWithLink = async (email, password) => {
    auth = getAuth();
    if ( isSignInWithEmailLink(auth, window.location.href) ) {
        const userCredentials = await signInWithEmailLink(auth, email, window.location.href);
        const user = userCredentials.user;
        await updatePassword(user, password);
        return auth.currentUser;
    } else {
        return null;
    }
};

const resendEmailWithLink = async (email) => {
    auth = getAuth();
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
}

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
  confirmPassword,
  getCurrentUser,
  saveCollection,
  saveCollectionByField,
  getCollection,
  getCollectionByField,
  getEntireCollection,
  resetPasswordInGoogle,
  createUserInGoogle,
  isVerifyEmailWithLink,
  verifyEmailWithLink,
  resendEmailWithLink,
  signIntoGoogle,
  signOutOfGoogle,
};