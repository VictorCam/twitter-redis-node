<template>
<Navigation></Navigation>
<div class="posts">
	<h2>Posts</h2>
		<form @submit.prevent="makePost()"> Make a Post:
			<input type="text" v-model="post.message" />
			<input class="submitpost" type="submit" value="Submit" />
    </form>


    <Modal v-if="toggle.display">
      <template #editform>
        <input @keyup.enter="editPost(toggle.post_id)" type="text" placeholder="edit post" v-model="edit.message">
				<button @click="editPost(toggle.post_id)">Update</button>
      </template>
    </Modal>


		<div v-for="post in all_posts" :key="post.id">
			<Ctest>
        <template #username>{{post.ID}}</template>
        <template #usercode>@{{post.ID}}</template>
				<template #body-content><p>{{post.post}}</p></template>
        <template #delete><button v-show="post.ID == user">📤</button></template>
        <template #dropdown1>
          <a v-show="post.ID == user" @click="deletePost(post.POST_ID)">Delete</a>
          <a v-show="post.ID == user" @click="passForm(!toggle.display, post.POST_ID)">Edit</a>
          <a>Stats</a>
        </template>
			</Ctest>
		</div>

</div>
</template>

<script>
import { reactive } from 'vue'
import { useStore } from 'vuex'
import { useState } from '@/helpers'
import Navigation from '@/components/Navigation.vue'
import Ctest from '@/components/Ctest.vue'
import Modal from '@/components/Modal.vue'

export default {
  name: 'Posts',
  components: {
    Navigation,
    Ctest,
    Modal
  },
  setup() {
    const store = useStore()


    const jtoggle = {display: false, post_id: null}
    const jpost = {message: ''} //json
    const jedit = {message: '',  post_id: null } //json
    
    const post = reactive({...jpost}) //post msg
    const edit = reactive({...jedit}) //edit msg
    const toggle = reactive({...jtoggle}) //modal

    function makePost() { //method
      store.dispatch("makePost", post)
      Object.assign(post, jpost)
    }

    function deletePost(post_id) { //method
      store.dispatch("deletePost", post_id)
    }

    function editPost(post_id) { //method
      edit.post_id = post_id
      store.dispatch("editPost", edit)
      Object.assign(edit, jedit)
      Object.assign(toggle, jtoggle)
    }

    function passForm(display, post_id) { //method
      toggle.display = display
      toggle.post_id = post_id
    }

    store.dispatch('all_posts') //api call
    store.dispatch('user') //api call
    const { all_posts, user } = useState(['all_posts', 'user']) //state api calls
    
    return { makePost, deletePost, editPost, user, post, all_posts, edit, toggle, passForm }
  }
}
</script>
