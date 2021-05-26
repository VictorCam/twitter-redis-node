<template>
  <Navigation></Navigation>
  <div class="notfound">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1>404 NOT FOUND</h1>
  </div>
</template>

<script>
import Navigation from '../components/Navigation.vue'

export default {
  name: 'NotFound',
  components: {
    Navigation
  }
}
</script>
