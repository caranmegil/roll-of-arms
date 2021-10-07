import { createApp } from 'vue'
import { createStore } from 'vuex';
import { createRouter,
    createWebHistory,
    //  createWebHashHistory,
     } from 'vue-router';

import App from './App.vue'

import Main from './components/Main.vue';
import Login   from './components/Login.vue';
import RegisterUser from './components/RegisterUser.vue';
import ResetPassword from './components/ResetPassword.vue';
import ProfileEdit from './components/ProfileEdit.vue';
import Verify from './components/Verify.vue';
import DiceBrowser from './components/DiceBrowser.vue';

const routes = [
    { path: '/', component: Main, meta: { requiresAuth: true } },
    { path: '/signin', component: Login },
    { path: '/register', component: RegisterUser },
    { path: '/reset', component: ResetPassword },
    { path: '/profile', component: ProfileEdit, meta: { requiresAuth: true } },
    { path: '/verify', component: Verify },
    { path: '/dicebrowser', component: DiceBrowser },
];

const router = createRouter( {
    history: createWebHistory(process.env.BASE_URL),
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

let app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
