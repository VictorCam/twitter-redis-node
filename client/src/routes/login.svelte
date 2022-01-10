<script context="module">
    export const load = ({session}) => {
        if(session.auth) return { status: 301, redirect: `/secure` }
        return {}
    }
</script>

<script>
import {session} from '$app/stores'
import {goto} from '$app/navigation'
import axios from 'axios'

var endpoint = import.meta.env.VITE_SERVER

async function validate(e) {
    var payload = {}
    for (let i = 0; i < e.target.length-1; i++) {
        payload[e.target[i].name] = e.target[i].value
    }
    var res = await axios.post(`${endpoint}/login`, payload, {withCredentials:true})
    if(res.status == 200) {
        session.set({...$session, "auth": true})
        goto("/secure")
    }
}
</script>
    
<style>
</style>

<h1>Login</h1>
<div>
    <form on:submit|preventDefault={validate} class="register">
    <input type="text" name="username" placeholder="username"/>
    <input type="password" name="password" placeholder="password" />
    <input type="submit" value="Submit">
</form>
</div>