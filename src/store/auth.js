import axios from "axios"

export default {
  state: {
    login: false
  },
  actions: {
    login({ commit }, payload) {
      payload = Object.assign({}, payload)
      axios.post("http://localhost:13377/login", payload, {withCredentials: true})
      .then(res => commit('SET_LOGIN', res.data))
      .catch(err => console.log("api error: /login", err))
    }
  },
  mutations: {
    SET_LOGIN(state, payload) {
      state.login = payload
    }
  }
}