<template>
<Navigation></Navigation>
<div class="posts">
	<h2>Posts</h2>
	<div v-if="user">
		<form @submit.prevent="makePost()"> Make a Post:
			<input type="text" v-model="post.message" />
			<input class="submitpost" type="submit" value="Submit" />
    </form>
		<div v-for="post in all_posts" :key="post.id">
			<Ctest>
				<template #data>
					<p>User: {{post.ID}}</p>
					<p>Body: {{post.post}}</p>
					<div v-show="post.ID == user">
						<input @keyup.enter="editPost(post.POST_ID)" type="text" placeholder="edit post" v-model="edit.message">
						<button @click="editPost(post.POST_ID)">Update</button>
						<button @click="deletePost(post.POST_ID)">Delete</button>
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
import { reactive } from 'vue'
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

    const jpost = {message: ''} //json
    const jedit = { message: '',  post_id: null } //json
    
    const post = reactive({...jpost}) //post msg
    const edit = reactive({...jedit}) //edit msg

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
    }

    store.dispatch('all_posts') //api call
    store.dispatch('user') //api call
    const { all_posts, user } = useState(['all_posts', 'user']) //state api calls
    
    return { makePost, deletePost, editPost, user, post, all_posts, edit }
  }
}
</script>
