import { createStore } from 'vuex'
import axios from "axios"
import router from '../router/index'

const getDefaultState = () => {
  return {
    profile: [],
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
  return Promise.reject(error)
})

axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (typeof error.response === 'undefined') {
    alert('A network error occurred')
    return Promise.reject("Response error #1:",error.response.data)
  }
  if(error.response.status === 401) {
      alert(`${error.response.data}`)
      router.push('/login')
  }
  if(error.response && error.response.data) {
    return Promise.reject("Response error #1:",error.response.data)
  }
  return Promise.reject("Response error #2:",error.message)
})

export default createStore({
  state: getDefaultState(),
  actions: {
    async login({ commit }, payload) {
      const res = await axios.post("http://localhost:13377/login", payload, {withCredentials: true})
      commit('SET_LOGIN', res.data) 
      router.push('/posts')
    },
    async signup({ commit }, payload) {
      const res = await axios.post("http://localhost:13377/signup", payload)
      commit("SET_SIGNUP", res.data)
    },
    async all_users({ commit }) {
      const res = await axios.get("http://localhost:13377/", {withCredentials: true})
      commit("SET_ALL_USERS", res.data)
    },
    async all_posts({ commit }) {
      const res = await axios.get("http://localhost:13377/posts", {withCredentials: true})
      console.log(res.data)
      commit('SET_ALL_POSTS', res.data)
    },
    async user({ commit }) {
      const res = await axios.get("http://localhost:13377/user", {withCredentials: true})
      commit('SET_USER', res.data)
    },
    async logout({ commit }) {
      await axios.get("http://localhost:13377/logout", {withCredentials: true})
      commit('SET_RESET')
      router.push('/login')
    },
    async deletePost({ commit }, payload) {
      const res = await axios.post("http://localhost:13377/delete_post", payload, {withCredentials:true})
      commit("SET_DELETE_POST", res.data)
    },
    async makePost({ commit }, payload) {
      const res = await axios.post("http://localhost:13377/create_post", payload, {withCredentials:true})
      commit("SET_CREATE_POST", res.data)
    },
    async editPost({ commit }, payload) {
      const res = await axios.post("http://localhost:13377/edit_post", payload, {withCredentials:true})
      commit("SET_EDIT_POST", res.data)
    },
    async profile({ commit }, payload) {
      const res = await axios.get(`http://localhost:13377/profile/${payload}`, {withCredentials:true})
      commit("SET_PROFILE", res.data)
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
      state.all_posts = payload.slice().reverse()
    },
    SET_USER(state, payload) {
      state.user = payload
    },
    SET_DELETE_POST(state, payload) {
      state.all_posts.splice(payload,1)
    },
    SET_CREATE_POST(state, payload) {
      state.all_posts.unshift(payload) 
    },
    SET_EDIT_POST(state, payload) {
      console.log("data", payload)
      state.all_posts[payload.index].post = payload.post
    },
    SET_PROFILE(state, payload) {
      state.profile = payload
    }
  }
})