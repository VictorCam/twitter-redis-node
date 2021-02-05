import { createStore } from 'vuex'
import axios from "axios"
import router from '../router/index'

const getDefaultState = () => {
  return {
    user: [],
    login: '',
    tmp: '',
    all_users: [],
    all_posts: [],
    signup: ''
  }
}

export default createStore({
  state: getDefaultState(),
  actions: {
    login({ commit }, payload) {
      axios.post("http://localhost:13377/login", payload, {withCredentials: true})
      .then(res => { 
        commit('SET_LOGIN', res.data) 
        router.push('/Posts')
      })
      .catch(err => {
        console.log("store error: login", err)
      })
    },
    signup({ commit }, payload) {
      axios.post("http://localhost:13377/signup", payload)
      .then(res => commit("SET_SIGNUP", res.data))
      .catch(err => {
        console.log("store error: signup", err)
      })
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/", {withCredentials: true})
      .then(res => commit("SET_ALL_USERS", res.data))
      .catch(err => {
        console.log("store error: all_users", err)
        router.push('/login')
      })
    },
    all_posts({ commit }) {
      axios.get("http://localhost:13377/posts", {withCredentials: true})
      .then(res => commit('SET_ALL_POSTS', res.data))
      .catch(err => {
        console.log("store error: all_posts", err)
        router.push('/login')
      })
    },
    user({ commit }) {
      axios.get("http://localhost:13377/user", {withCredentials: true})
      .then(res => commit('SET_USER', res.data))
      .catch(err => {
        console.log("store error: user", err)
        router.push('/login')
      })
    },
    logout({ commit }) {
      axios.get("http://localhost:13377/logout", {withCredentials: true})
      .then( commit('SET_RESET') )
      .catch(err => {
        console.log("store error: reset", err)
        commit('SET_RESET')
        router.push('/login')
      })
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
    },
    SET_ALL_POSTS(state, payload) {
      state.all_posts = payload
    },
    SET_USER(state, payload) {
      state.user = payload
    }
  }
})