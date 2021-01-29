import { createStore } from 'vuex'
import axios from "axios"
import createPersistedState from 'vuex-persistedstate'
import auth from "./auth"
import SecureLS from "secure-ls";
var ls = new SecureLS({isCompression:true});

export default createStore({
  modules: {
    auth: auth
  },
  plugins: [createPersistedState({
    paths: ['auth'],
    storage: {
      getItem: (key) => ls.get(key),
      setItem: (key, value) => ls.set(key, value),
      removeItem: (key) => ls.remove(key),
    }})
  ],
  state: {
    tmp: '',
    all_users: [],
  },
  actions: {
    tmp({ commit }) {
      commit('SET_TMP', 'wow')
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/")
      .then(res => commit("SET_ALL_USERS", res.data))
      .catch(err => console.log("api error: (test route)", err))
    }
  },
  mutations: {
    SET_TMP(state, payload) {
      state.tmp = payload
    },
    SET_ALL_USERS(state, payload) {
      state.all_users = payload
    }
  }
})
