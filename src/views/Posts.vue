<template>
<Navigation></Navigation>
  <div class="about">
    <h2>Posts</h2>
    <!-- <div v-if="user"> -->

    <form @submit.prevent="onSubmit()">
      POST:
      <input type="text" v-model="form.message" />
      <input class="submitpost" type="submit" value="Submit" />
    </form>

    <br>
    <br>
    <br>

      <div v-for="(post) in all_posts" :key="post.id">
      <Ctest>
        <template #data>
          <p>User: {{post.ID}}</p>
          <p>Body: {{post.post}}</p>
          <!-- <button v-show="post.ID == user">Make Post</button> -->
          <!-- <button v-show="post.ID != user || post.ID == user">View Stats</button> -->
        </template>
      </Ctest>
      </div>
    </div>

    <!-- <div v-else>LOADING</div> -->
    
  <!-- </div> -->
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useState } from '@/helpers'
import Navigation from '@/components/Navigation.vue'
import Ctest from '@/components/Ctest.vue'

export default {
  name: 'Posts',
  components: {
    Navigation,
    Ctest
  },
  setup() {
    const store = useStore()
    const form = ref({message: ''}) //form signup

    function onSubmit() { //method
    console.log('hi')
    }

    store.dispatch('all_posts') //api call
    // store.dispatch('user') //api call
    const { all_posts } = useState(['all_posts']) //state api calls
    
    return { onSubmit, form, all_posts }
  }
}
</script>
