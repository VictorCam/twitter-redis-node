<template>
<Navigation></Navigation>
  <div class="about">
    <h2>Posts</h2>

    <form v-if="ID" @submit.prevent="cpost">
      Make a post:
      <br>
      <input type="text" v-model="addpost.content" />
      <input class="submitpost" type="submit" value="Submit" />
    </form>
    
  </div>
</template>

<script>
import Navigation from '../components/Navigation.vue'

export default {
  name: 'Posts',
  components: {
    Navigation
  }
}
</script>
