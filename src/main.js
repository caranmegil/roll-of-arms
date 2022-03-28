import { createApp } from 'vue'
import { createStore } from 'vuex';
import {
    createRouter,
    createWebHistory,
} from 'vue-router';
import VueTour from 'v3-tour';
import { UnleashClient } from 'unleash-proxy-client';

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
import MyForces from './components/MyForces.vue';
import VerificationFailure from './components/VerificationFailure.vue';
import AccountTransfer from './components/AccountTransfer.vue';
import ForcesDiceBrowser from './components/ForcesDiceBrowser.vue';
import ReleaseNotes from './components/ReleaseNotes.vue';

const routes = [
    { path: '/', component: Main, meta: { requiresAuth: true } },
    { path: '/signin', component: Login },
    { path: '/register', component: RegisterUser },
    { path: '/reset', component: ResetPassword },
    { path: '/profile', component: ProfileEdit, meta: { requiresAuth: true } },
    { path: '/profile/:id', component: ProfileView },
    { path: '/auth', component: Auth },
    { path: '/dicebrowser', component: DiceBrowser, meta: { requiresAuth: true } },
    { path: '/forcesdicebrowser', component: ForcesDiceBrowser, meta: { requiresAuth: true } },
    { path: '/my-collection', component: DiceCollection, meta: { requiresAuth: true } },
    { path: '/my-forces', component: MyForces, meta: { requiresAuth: true } },
    { path: '/verifywarn', component: VerificationFailure, meta: { requiresAuth: false } },
    { path: '/account-transfer', component: AccountTransfer, meta: { requiresAuth: true } },
    { path: '/releasenotes', component: ReleaseNotes }
];

const router = createRouter( {
    history: createWebHistory('/'),
    routes,
});

const unleash = new UnleashClient({
  url: 'https://featureflags.nerderium.com/proxy',
  clientKey: import.meta.env.VITE_UNLEASH_TOKEN,
  appName: import.meta.env.VITE_UNLEASH_APP_NAME,
  environment: import.meta.env.VITE_UNLEASH_ENV,
});

router.beforeEach( async (to, from, next) => {
    const credentials = store.state.credentials;

    if ( credentials && credentials.email && credentials.password ) {
      let user = await signIntoGoogle(credentials.email, credentials.password);
      store.commit('setUser', user);
    }

    if (to.meta && to.meta.requiresAuth) {
        if(store.state.user != null) {
            // Used to set the context fields, shared with the Unleash Proxy
            unleash.updateContext({ userId: credentials.email });

            // Start the background polling
            unleash.start();
            const forcesBuilderValue = unleash.isEnabled('forces_builder');
            store.commit('setFeatureFlags', {forces_builder: forcesBuilderValue,});
            next();
        } else {
            next({ path: '/signin'});
        }
    } else {
        // var user = {
        //     anonymous: true,
        // };
        
        // // Create a single instance of the LaunchDarkly client
        // const ldClient = LDClient.initialize(import.meta.env.VITE_LD_ENV_ID, user);
        // await ldClient.waitUntilReady();
        // const forcesBuilderValue = ldClient.variation("forces_builder", false);
        // store.commit('setFeatureFlags', {forces_builder: forcesBuilderValue,});
        
        next();
    }
});

const store = createStore({
    state() {
        return {
            user: JSON.parse(localStorage.getItem('user') || null),
            credentials: JSON.parse(localStorage.getItem('credentials') || '{}'),
            bufferDie: null,
            forceName: null,
            forceSlot: 'Home',
            filters: {species: '', edition: '', size: '', type: '',},
            dice: JSON.parse(localStorage.getItem('dice') || 'null'),
            myForces: null,
            featureFlags: {},
        };
    },
    getters: {
        getMyForces(state) {
            let myForce = state.myForces;

            if (myForce != null) {
                myForce.sort( (a,b) => a.name.localeCompare(b.name));
            }

            return myForce;
        },
        getForceName(state) {
            return state.forceName;
        },
    },
    mutations: {
        setUser(state, user) {
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;
        },
        setCredentials(state, credentials) {
            state.credentials = credentials;
            localStorage.setItem('credentials', JSON.stringify(credentials))
        },
        setBufferDie(state, die) {
            state.bufferDie = die;
        },
        setFilters(state, filters) {
            state.filters = filters;
        },
        setDice(state, dice) {
            state.dice = dice;
            localStorage.setItem('dice', JSON.stringify(dice));
        },
        setForceSlot(state, slot) {
            state.forceSlot = slot;
        },
        setForceName(state, forceName) {
            state.forceName = forceName;
        },
        setMyForces(state, myForces) {
            state.myForces = myForces;
        },
        setFeatureFlags(state, flagValue) {
            state.featureFlags = flagValue;
        },
        signOut(state) {
            state.user = null;
            state.credentials = {}
            state.filters = {species: '', edition: '', size: '', type: '',}
            state.dice = [];
            state.forceSlot = 'Home';
            state.forceName = null;
            state.bufferDie = null;
            state.myForces = [];
            state.featureFlags = {};
            localStorage.setItem('credentials', JSON.stringify({}));
            localStorage.setItem('dice', JSON.stringify(null));
            localStorage.setItem('user', JSON.stringify(null));
        },
    },
    actions: {
        setUser({ commit }, user) {
            commit('setUser', user);
        },
        setCredentials({ commit }, credentials) {
            commit('setCredentials', credentials);
        },
        setBufferDie({ commit }, die) {
            commit('setBufferDie', die);
        },
        setFilters({ commit }, filters) {
            commit('setFilters', filters);
        },
        setAreaFilters({ commit }, filters) {
            commit('setFilters', filters);
        },
        setDice({ commit }, dice) {
            commit('setDice', dice);
        },
        setForceSlot({ commit }, slot) {
            commit('setForceSlot', slot);
        },
        setForceName( { commit }, forceName) {
            commit( 'setForceName', forceName);
        },
        setMyForces( { commit }, myForces) {
            commit('setMyForces', myForces);
        },
        setFeatureFlags({ commit }, flagValue) {
            commit('setFeatureFlags', flagValue);
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
