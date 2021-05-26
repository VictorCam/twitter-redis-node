<template>
  <div id="main">
  <router-view/>
  </div>
</template>

<script>
// import { useStore } from 'vuex'
export default {
  name: 'App',
  setup() {
    // const store = useStore()
    // store.dispatch('user') //created api call
  }
}
</script>

<style>

body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
