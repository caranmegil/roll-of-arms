import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    checkActionCode,
    isSignInWithEmailLink,
    confirmPasswordReset,
    EmailAuthProvider,
    reauthenticateWithCredential,
    applyActionCode,
    updateEmail,
    signInWithEmailLink,
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

// generic collection actions
const saveCollectionByField = async (collectionName, fieldName, data) => {
    try {
        auth = getAuth();
        const collectionNameUserRef = ref(db, collectionName + '/' + fieldName);
        return await set(collectionNameUserRef, data);
    } catch (e) {
        console.error(e);
        return false;
    }
};

const saveCollection = async (collectionName, data) => {
    try {
        auth = getAuth();
        const user = auth.currentUser;
        const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
        await set(collectionNameUserRef, data);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

const getCollection = async (collectionName) => {
    try {
        auth = getAuth();
        const user = auth.currentUser;
        if (user != null) {
            const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
            const snapshot = await get(collectionNameUserRef)

            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                return null;
            }
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
    const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${location.protocol}//${location.hostname}${(location.port) ? ':' + location.port : ''}`,
        // This must be true.
        handleCodeInApp: true,
    };
    
    const val = await createUserWithEmailAndPassword(auth, email, password);
    sendSignInLinkToEmail(auth, email, actionCodeSettings);

    return val;
};

const confirmPassword = async (authCode, password) => {
    try {
        let auth = getAuth();
        return await confirmPasswordReset(auth, authCode, password).then(() => { return new Promise(resolve => resolve(true)) } );
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
    return userCredential.user;
};

const signInAgain = async (func) => {
    getAuth().onAuthStateChanged(func);
};

const isVerifyEmailWithLink = async () => {
    auth = getAuth();
    return isSignInWithEmailLink(auth, window.location.href);
};

const verifyEmailWithLink = async (email, password, actionCode) => {
    console.log(actionCode);
    if ( isSignInWithEmailLink(auth, window.location.href) ) {
        const userCredentials = await signInWithEmailLink(auth, email, window.location.href);
        const user = userCredentials.user;
        await updatePassword(user, password);
        return user;
    } else {
        return null;
    }
};

const resendEmailWithLink = async (email) => {
    auth = getAuth();
    const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${location.protocol}//${location.hostname}${(location.port) ? ':' + location.port : ''}`,
        // This must be true.
        handleCodeInApp: true,
    };
    
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

const changeEmail = async (newEmail, oldEmail, password) => {
    const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${location.protocol}//${location.hostname}${(location.port) ? ':' + location.port : ''}`,
        // This must be true.
        handleCodeInApp: true,
    };

    auth = getAuth();

    const emailAuthCredential = await EmailAuthProvider.credential(oldEmail, password);
    await reauthenticateWithCredential(auth.currentUser, emailAuthCredential).then(userCredential => {
        return updateEmail(userCredential.user, newEmail, actionCodeSettings);
    })

    return true;
}

const recoverEmail = async (email, actionCode) => {
    auth = getAuth();
    if (await checkActionCode(auth, actionCode)) {
        await applyActionCode(auth, actionCode);
        await sendPasswordResetEmail(auth, email);
        return true;
    }

    return false;
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
  signInAgain,
  signOutOfGoogle,
  changeEmail,
  recoverEmail,
};