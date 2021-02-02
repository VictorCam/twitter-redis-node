<template>
<Navigation></Navigation>
  <div class="signup">
    <h1>Sign Up</h1>
      <form @submit.prevent="onSubmit()">
      UserName:
      <br />
      <input type="text" name="username" v-model.trim="form.username" />
      <br />Password:
      <br />
      <input type="password" name="password" v-model.trim="form.password" />
      <br />
      <br />
      <input type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useStateAuth } from '@/helpers'
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'signup',
  components: {
    Navigation
  },
  setup() {
    const store = useStore()
    const form = ref({username:'', password:''}) //form signup

    function onSubmit() { //method
      store.dispatch('signup', form.value) //api call
      form.value.username = form.value.password = '' //form reset
    }

    const { signup } = useStateAuth(['signup']) //state api calls
    
    return { onSubmit, form, signup } //computed api call
  }
}
</script>