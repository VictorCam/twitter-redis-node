<template>
<Navigation></Navigation>
  <div class="login">
    <h1>Login</h1>

    {{login}}

    <form @submit.prevent="onSubmit()">
      UserName:
      <br />
      <input type="text" name="username" v-model.trim="f_login.username" />
      <br />Password:
      <br />
      <input type="password" name="password" v-model.trim="f_login.password" />
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
  name: 'Login',
  components: {
    Navigation
  },
  setup() {
    const store = useStore()
    const f_login = ref({username:'', password:''}) //form login

    function onSubmit() { //method
      store.dispatch('login', f_login.value) //api call
      f_login.value.username = f_login.value.password = '' //form reset
    }

    const { login } = useStateAuth(['login']) //state api calls
    
    return { onSubmit, f_login, login } //computed api call
  }
}
</script>