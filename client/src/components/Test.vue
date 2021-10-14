<template>
<div>
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
  <div>test: {{count}}</div>
</div>
</template>

<script>
import { reactive } from 'vue'
import { state } from '../js/state'
export default {
  name: 'signup',
  setup() {
    // const store = useStore()
    const jform = {username:'', password:''} //json
    const form = reactive({...jform}) //form signup

    async function onSubmit() { //method
      var test = await fetch('http://localhost:13377/test', {
      method: 'GET', headers: {'Content-Type': 'application/json','mode': 'cors'}})

      console.log(test)

      var test = await fetch('http://localhost:13377/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'mode': 'cors'}})
    
    // console.log("test", state)
    //   store.dispatch('signup', form) //api call
      Object.assign(form, jform)
    }

    return { onSubmit, form, count: state['count']}
  }
}
</script>