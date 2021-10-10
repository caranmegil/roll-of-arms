import { createApp } from 'vue'
import { createStore } from 'vuex';
import {
    createRouter,
    createWebHistory,
} from 'vue-router';
import VueTour from 'v3-tour';

import 'v3-tour/dist/vue-tour.css';

import { signIntoGoogle } from '@/firebase';

import App from './App.vue'

import Main from './components/Main.vue';
import Login   from './components/Login.vue';
import RegisterUser from './components/RegisterUser.vue';
import ResetPassword from './components/ResetPassword.vue';
import ProfileEdit from './components/ProfileEdit.vue';
import ProfileView from './components/ProfileView.vue';
import Auth from './components/Auth.vue';
import DiceBrowser from './components/DiceBrowser.vue';
import DiceCollection from './components/DiceCollection.vue';

const routes = [
    { path: '/', component: Main, meta: { requiresAuth: true } },
    { path: '/signin', component: Login },
    { path: '/register', component: RegisterUser },
    { path: '/reset', component: ResetPassword },
    { path: '/profile', component: ProfileEdit, meta: { requiresAuth: true } },
    { path: '/profile/:id', component: ProfileView },
    { path: '/auth', component: Auth },
    { path: '/dicebrowser', component: DiceBrowser },
    { path: '/collection', component: DiceCollection },
];

const router = createRouter( {
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach( async (to, from, next) => {

    if (to.meta && to.meta.requiresAuth && store.state.credentials.email !== undefined) {
        const user = await signIntoGoogle(store.state.credentials.email, store.state.credentials.password);
        store._actions.setUser[0](user);
        if(user != null) {
            next();
        } else {
            next({ path: '/signin'});
        }
    } else {
        next();
    }
});


const store = createStore({
    state() {
        return {
            user: null,
            credentials: JSON.parse(localStorage.getItem('credentials') || '{}'),
            collectionDie: null,
            filters: {species: 'Amazon', edition: '-'}
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
        setCollectionDie(state, collectionDie) {
            state.collectionDie = collectionDie;
        },
        setFilters(state, filters) {
            state.filters = filters;
        },
        signOut(state) {
            state.isProfileMenuOpen = false;
            state.user = null;
            state.credentials = {}
            state.filters = {species: 'Amazon', edition: '-'}
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
        setCollectionDie({ commit }, collectionDie) {
            commit('setCollectionDie', collectionDie);
        },
        setFilters({ commit }, filters) {
            commit('setFilters', filters);
        },
        signOut({ commit }) {
            commit('signOut');
        },
    },
});

createApp(App)
    .use(store)
    .use(router)
    .use(VueTour)
    .mount('#app');
