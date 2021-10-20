import {writable} from 'svelte/store'
import {goto} from '$app/navigation'
import axios from 'axios'

async function registerapi(payload) {
  console.log("payload", payload.username.value)
  console.log("payload", payload.password.value)


  //if(login) goto(jwt only page) : stay & send error
  goto("/")
}


//https://www.reddit.com/r/sveltejs/comments/mor0qd/protect_routes_in_sveltekit/
async function authGuard() {  
  //if(jwt) true : false
}



export {registerapi, authGuard}