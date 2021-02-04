import { createStore } from 'vuex'
import axios from "axios"

const getDefaultState = () => {
  return {
    login: '',
    tmp: '',
    all_users: [],
    signup: ''
  }
}

export default createStore({
  state: getDefaultState(),
  actions: {
    login({ commit }, payload) {
      payload = Object.assign({}, payload)
      axios.post("http://localhost:13377/login", payload, {withCredentials: true})
      .then(res => commit('SET_LOGIN', res.data))
      .catch(err => console.log("api error: /login", err))
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/", {withCredentials: true})
      .then(res => commit("SET_ALL_USERS", res.data))
      .catch(err => console.log("store error: all_users", err))
    },
    signup({ commit }, payload) {
      axios.post("http://localhost:13377/signup", payload)
      .then(res => commit("SET_SIGNUP", res.data))
      .catch(err => console.log("store error: signup", err))
    },
    reset({ commit }) {
      axios.get("http://localhost:13377/logout", {withCredentials: true})
      .then( commit('SET_RESET') )
      .catch(err => console.log("store error: resetting state", err))
    }
  },

  mutations: {
    SET_LOGIN(state, payload) {
      state.login = payload
    },
    SET_TMP(state, payload) {
      state.tmp = payload
    },
    SET_ALL_USERS(state, payload) {
      state.all_users = payload
    },
    SET_SIGNUP(state, payload) {
      state.signup = payload
    },
    SET_RESET(state) {
      Object.assign(state, getDefaultState())
    }
  }
})
