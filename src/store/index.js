import { createStore } from 'vuex'
import axios from "axios"

export default createStore({
  state: {
    tmp: [],
    all_users: []
  },
  modules: {
  },
  getters: {
  },
  actions: {
    tmp({ commit }) {
      console.log('hello there I am working!')
      commit('SET_TMP', 'wow')
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/").then(res => {
        commit("SET_ALL_USERS", res.data);
      })
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
