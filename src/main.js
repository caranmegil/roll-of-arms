import { createApp } from 'vue'
import { createStore } from 'vuex';
import { createRouter, createWebHashHistory } from 'vue-router';

import App from './App.vue'

import Main from './components/Main.vue';
import Login   from './components/Login.vue';
import RegisterUser from './components/RegisterUser.vue';
import ResetPassword from './components/ResetPassword.vue';
import ProfileEdit from './components/ProfileEdit.vue';
import Verify from './components/Verify.vue';

const routes = [
    { path: '/', component: Main },
    { path: '/signin', component: Login },
    { path: '/register', component: RegisterUser },
    { path: '/reset', component: ResetPassword },
    { path: '/profile', component: ProfileEdit },
    { path: '/verify', component: Verify },
];

const router = createRouter( {
    history: createWebHashHistory(),
    routes,
});

const store = createStore({
    state() {
        return {
            user: null,
            credentials: JSON.parse(localStorage.getItem('credentials') || '{}'),
            isProfileMenuOpen: false,
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
        signOut(state) {
            state.isProfileMenuOpen = false;
            state.user = null;
            state.credentials = {}
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
        signOut({ commit }) {
            commit('signOut');
        },
    },
});

function callbackRedirect() {
}

let app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
