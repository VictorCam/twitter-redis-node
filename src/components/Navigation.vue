<template>
  <div class="Navigation">
    <h1>Project CodeCanine</h1>
    <router-link to="/">Test</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/posts">Posts</router-link> |
    <router-link to="/login">Login</router-link> |
    <router-link to="/Signup">Sign Up</router-link> |
    <router-link to="/profile/1">Profile</router-link> |
    <button @click="logout()">LOGOUT</button>
  </div>
</template>

<script>
import { useStore } from 'vuex'


export default {
  name: 'Navigation',
  setup() {
    const store = useStore()

    function logout() { //method
      store.dispatch("logout")
    }

    return { logout }
  }
}
</script>