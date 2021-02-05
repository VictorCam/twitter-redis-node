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


axios.interceptors.request.use(function (response) {
  return response
}, function (error) {
  return Promise.reject(error);
})


axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (typeof error.response === 'undefined') {
    alert('A network error occurred. '
        + 'This could be a CORS issue or a dropped internet connection. '
        + 'It is not possible for us to know.')
  }
  if(error.response.status === 401) {
      console.log("401 status caught")
      alert("You are not authorized")
      router.push('/login')
  }
  else {
      alert('A network error occurred. '
          + 'This could be a CORS issue or a dropped internet connection. '
          + 'It is not possible for us to know.')
  }
  if (error.response && error.response.data) {
      return Promise.reject("Response error #1:",error.response.data)
  }
  return Promise.reject("Response error #2:",error.message)
})

export default createStore({
  state: getDefaultState(),
  actions: {
    login({ commit }, payload) {
      axios.post("http://localhost:13377/login", payload, {withCredentials: true})
      .then(res => { 
        commit('SET_LOGIN', res.data) 
        router.push('/Posts')
      })
    },
    signup({ commit }, payload) {
      axios.post("http://localhost:13377/signup", payload)
      .then(res => commit("SET_SIGNUP", res.data))
    },
    all_users({ commit }) {
      axios.get("http://localhost:13377/", {withCredentials: true})
      .then(res => commit("SET_ALL_USERS", res.data))
    },
    all_posts({ commit }) {
      axios.get("http://localhost:13377/posts", {withCredentials: true})
      .then(res => commit('SET_ALL_POSTS', res.data))
    },
    user({ commit }) {
      axios.get("http://localhost:13377/user", {withCredentials: true})
      .then(res => commit('SET_USER', res.data))
    },
    logout({ commit }) {
      axios.get("http://localhost:13377/logout", {withCredentials: true})
      .then( commit('SET_RESET') )
    },
    reset({ commit }) {
      commit('SET_RESET')
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