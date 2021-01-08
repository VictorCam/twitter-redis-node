<template>
  <div id="Test">
    <Navigation></Navigation>
    <h2>Test</h2>
    <div v-for="name in all_users" :key="name.id">
    <Post>
      <template #data>
          <p>{{name.ID}}</p>
          <p>{{name.Name}}</p>
      </template>
    </Post>
    </div>
    {{tmp}}
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { useState } from '../helpers'
import Post from '../components/Post.vue'
import Navigation from '../components/Navigation.vue'

export default {
  name: 'Test',
  components: {
    Post, Navigation
  },
  setup() {
    const store = useStore()

    store.dispatch('all_users') //created api call
    store.dispatch('tmp') //created api call
    const { all_users, tmp } = useState(['all_users','tmp']) //computed api call
    return { all_users, tmp }
  }
}
</script>
