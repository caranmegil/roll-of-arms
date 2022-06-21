import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
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
    linkWithCredential,
    deleteUser,
} from "firebase/auth";

import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    "apiKey": process.env.VITE_apiKey,
    "authDomain": process.env.VITE_authDomain,
    "databaseURL": process.env.VITE_databaseURL,
    "projectId": process.env.VITE_projectId,
    "storageBucket": process.env.VITE_storageBucket,
    "messagingSenderId": process.env.VITE_messagingSenderId,
    "appId": process.env.VITE_appId,
    "measurementId": process.env.VITE_measurementId
};

const app = initializeApp(firebaseConfig)
let store = null;
const analytics = getAnalytics(app)
let auth = null;
let user = null;
// utils
const db = getDatabase(app);

const setStore = ($store) => {
    store = $store;
}

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
        const user = getCurrentUser();
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
        const user = getCurrentUser();
        if (user != null) {
            const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
            const snapshot = await get(collectionNameUserRef)

            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.error('snapshot does not exist');
                return null;
            }
        } else {
            console.error('user is ', user);
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

const getCollectionOn = (collectionName, callback) => {
    try {
        auth = getAuth();
        const user = getCurrentUser();
        if (user != null) {
            const collectionNameUserRef = ref(db, collectionName + '/' + user.uid);
            onValue(collectionNameUserRef, (snapshot) => {
                callback(snapshot.val());
            });
        }
    } catch (e) {
        console.error(e);
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

const deleteProfile = async (email) => {
    const auth = getAuth();
    const user = auth.currentUser;
    await deleteUser(user);
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
    user = getCurrentUser();

    if (!user) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    }
};

const signInAgain = async (func) => {
    getAuth().onAuthStateChanged(func);
};

const isVerifyEmailWithLink = async () => {
    auth = getAuth();
    return isSignInWithEmailLink(auth, window.location.href);
};

const verifyAndChangeEmail = (email, password, actionCode) => {
    let auth = getAuth();
    return checkActionCode(auth, actionCode).then( async () => {
        await applyActionCode(auth, actionCode);
        const credential = EmailAuthProvider.credential(email, password);
        const userCredential = await linkWithCredential(auth, credential);
        return userCredential.user;
    }).catch( () => null);
};

const verifyEmailWithLink = async (email, password, actionCode) => {
    let auth = getAuth();
    if ( isSignInWithEmailLink(auth, window.location.href) ) {
        return checkActionCode(auth, actionCode).then( async () => {
            const userCredentials = await signInWithEmailLink(auth, email, window.location.href);
            const user = userCredentials.user;
            // await applyActionCode(auth, actionCode);
            await updatePassword(user, password);
            return user;
        }).catch( () => null)
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

    if (user == null) {
        user = store.state.user;
    }
    return user;
}

const changeEmail = async (newEmail, oldEmail, password) => {
    auth = getAuth();

    const emailAuthCredential = await EmailAuthProvider.credential(oldEmail, password);
    await reauthenticateWithCredential(getCurrentUser(), emailAuthCredential).then(async userCredential => {
        await updateEmail(userCredential.user, newEmail);
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
  setStore,
  confirmPassword,
  getCurrentUser,
  saveCollection,
  saveCollectionByField,
  getCollection,
  getCollectionOn,
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
  verifyAndChangeEmail,
  deleteProfile,
};