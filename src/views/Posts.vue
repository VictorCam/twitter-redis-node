<template>
<Navigation></Navigation>
  <div class="about">
    <h2>Posts</h2>
    <div v-if="user">

    <form @submit.prevent="makePost()">
      Make a Post:
      <input type="text" v-model="post.msg" />
      <input class="submitpost" type="submit" value="Submit" />
    </form>


      <div v-for="(post, index) in all_posts" :key="post.id">
      <Ctest>
        <template #data>
          <p>User: {{post.ID}}</p>
          <p>Body: {{post.post}}</p>
          <div v-show="post.ID == user">
            <input @keyup.enter="editPost(post.POST_ID, index)" type="text" placeholder="edit post" v-model="edit.msg" >
            <button  @click="editPost(post.POST_ID, index)">Update</button>
            <button @click="deletePost(post.POST_ID, index)">Delete</button>
          </div>
          <button>View Stats</button>
        </template>
      </Ctest>
      </div>
    </div>

    <div v-else>LOADING</div>
    
  </div>
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
    const post = ref({msg: ''}) //post msg
    const edit = ref({msg: ''}) //edit msg

    function makePost() { //method
      store.dispatch("makePost", [post.value.msg])
      post.value.msg = ''
    }

    function deletePost(post_id, index) { //method
      store.dispatch("deletePost", [post_id, index])
    }

    function editPost(post_id, index) { //method
      store.dispatch("editPost", [edit.value.msg, post_id, index])
      edit.value.msg = ''
    }

    store.dispatch('all_posts') //api call
    store.dispatch('user') //api call
    const { all_posts, user } = useState(['all_posts', 'user']) //state api calls
    
    return { makePost, deletePost, editPost, user, post, all_posts, edit }
  }
}
</script>
