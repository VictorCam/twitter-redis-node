import { createStore } from 'vuex'
import axios from "axios"
import createPersistedState from 'vuex-persistedstate'
import auth from './auth'
import Cookies from 'js-cookie'

export default createStore({
  modules: {
    auth: auth
  },
  plugins: [createPersistedState({
    paths: ['auth'],
    storage: {
      getItem: (key) => Cookies.get(key),
      setItem: (key, value) => Cookies.set(key, value, {sameSite: 'Lax'}),
      removeItem: (key) => Cookies.remove(key),
    }})
  ],
  state: {
    tmp: '',
    all_users: [],
    signup: ''
  },
  actions: {
    tmp() {
      console.log("test")
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/", {withCredentials: true})
      .then(res => commit("SET_ALL_USERS", res.data))
      .catch(console.log("store error: all_users"))
    },
    signup({ commit }, payload) {
      axios.post("http://localhost:13377/signup", payload)
      .then(res => commit("SET_SIGNUP", res.data))
      .catch(console.log("store error: signup"))
    }
  },
  mutations: {
    SET_TMP(state, payload) {
      state.tmp = payload
    },
    SET_ALL_USERS(state, payload) {
      state.all_users = payload
    },
    SET_SIGNUP(state, payload) {
      state.signup = payload
    }
  }
})
