<template>

<nav class="nav">
  <div class="container">
    <a class="brand" style="color: rgb(255,255,255);">Project CodeCanine</a>
    <router-link class="nav-item" to="/">Test</router-link> |
    <router-link class="nav-item" to="/about">About</router-link> |
    <router-link class="nav-item" to="/posts">Posts</router-link> |
    <router-link class="nav-item" to="/login">Login</router-link> |
    <router-link class="nav-item" to="/Signup">Sign Up</router-link> |
    <router-link class="nav-item" to="/profile/">Profile</router-link> |
    <router-link class="nav-item" to="/upload">Upload</router-link> |
    <button @click="logout()">LOGOUT</button>
  </div>
</nav>
</template>

<script>
import { useStore } from 'vuex'

export default {
  name: 'Navigation',
  setup() {
    const store = useStore()

    function logout() { store.dispatch("logout") }

    return { logout }
  }
}
</script>

<style scoped>

.nav-item {
  text-decoration: none;
  color: rgb(151, 180, 233);
}

.brand {
  text-decoration: none;
  background-color: transparent;
  display: inline-block;
  padding-top: .3125rem;
  padding-bottom: .3125rem;
  margin-right: 1rem;
  font-size: 1.25rem;
  line-height: inherit;
  white-space: nowrap;
}

.nav {
  padding-top: .75em;
  padding-bottom: .75em;
  color: #333;
  border-radius: 0;
  box-shadow: none;
  border: none;
  margin-bottom: 0;
  position: sticky;
  top: 0px;
  z-index: 1020;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: .1rem 1rem;
  background-color: rgb(45,45,45);
}

.container {
  padding-right: 0;
  padding-left: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  box-sizing: border-box;
}

#main a.router-link-exact-active {
  color: #42b983;
}
</style>
