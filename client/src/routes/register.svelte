<script context="module">
    export const load = ({session}) => {
        if(session.auth) return { status: 301, redirect: `/secure` }
        return {}
    }
</script>

<script>
import axios from 'axios'
import {goto} from '$app/navigation'

var endpoint = import.meta.env.VITE_SERVER

async function validate(e) {
    var payload = {}
    for (let i = 0; i < e.target.length-1; i++) {
        payload[e.target[i].name] = e.target[i].value
    }
    var res = await axios.post(`${endpoint}/register`, payload, {withCredentials:true})
    if(res.status == 200) goto("/login")
}
</script>

<style>
</style>

<h1>Register</h1>
<div>
    <form on:submit|preventDefault={validate} class="register">
    <input type="text" name="username" placeholder="username"/>
    <input type="text" name="email" placeholder="email"/>
    <input type="text" name="phone" placeholder="phone"/>
    <input type="password" name="password" placeholder="password" />
    <input type="submit" value="Submit">
</form>
</div>