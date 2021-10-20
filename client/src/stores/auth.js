import {writable} from 'svelte/store'
import { goto } from '$app/navigation'
import axios from 'axios'

var register = writable([])
var user = writable([])


async function registerapi(payload) {
    console.log("payload", payload.username.value)
    console.log("payload", payload.password.value)
    //if valid goto /
    goto("/")
}

export {register, registerapi, user}