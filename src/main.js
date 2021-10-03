import { createApp } from 'vue'
import { createStore } from 'vuex';

import App from './App.vue'

import authConfig from './auth/auth_config.json';
import { setupAuth } from './auth';

const store = createStore({
    state() {
        return {
            user: null,
            credentials: JSON.parse(localStorage.getItem('credentials') || '{}'),
            isProfileMenuOpen: false,
            userRegistrationState: false,
            passwordResetState: false,
        };
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setCredentials(state, credentials) {
            state.credentials = credentials;
            localStorage.setItem('credentials', JSON.stringify(credentials))
        },
        setProfileMenuState(state, isOpen) {
            state.isProfileMenuOpen = isOpen;
        },
        setUserRegistrationState(state, isOpen) {
            state.userRegistrationState = isOpen;
        },
        setPasswordResetState(state, passwordResetState) {
            state.passwordResetState = passwordResetState;
        },
        signOut(state) {
            state.isProfileMenuOpen = false;
            state.user = null;
            state.userRegistrationState = false;
            state.passwordResetState = false;
            localStorage.setItem('credentials', JSON.stringify({}));
        },
    },
    actions: {
        setUser({ commit }, user) {
            commit('setUser', user);
        },
        setCredentials({ commit }, credentials) {
            commit('setCredentials', credentials);
        },
        setProfileMenuState({ commit }, isOpen) {
            commit('setProfileMenuState', isOpen);
        },
        setUserRegistrationState({ commit }, isOpen) {
            commit('setUserRegistrationState', isOpen);
        },
        setPasswordResetState({ commit }, passwordResetState) {
            commit('setPasswordResetState', passwordResetState);
        },
        signOut({ commit }) {
            commit('signOut');
        },
    },
});

function callbackRedirect() {
}

let app = createApp(App);
setupAuth( authConfig, callbackRedirect ).then( (auth) => {
    app.use(store);
    app.use(auth);
    app.mount('#app');
})
