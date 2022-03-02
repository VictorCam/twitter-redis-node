<script context="module">
    export const load = ({session}) => {
        if(session.auth) return { status: 301, redirect: `/secure` }
        return {}
    }
</script>

<script>
import axios from 'axios'
import {goto} from '$app/navigation'
import Footer from '../components/Footer.svelte'
import Header from '../components/Header.svelte'

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

<Header></Header>
<div class="grid">
    <form class="reg-c" on:submit|preventDefault={validate}>
        <h1 class="title">Register</h1>
        <input id="reg-i" type="text" name="username" placeholder="username"/>
        <input id="reg-i" type="text" name="email" placeholder="email"/>
        <input id="reg-i" type="text" name="phone" placeholder="phone"/>
        <input id="reg-i" type="password" name="password" placeholder="password" />
        <input id="reg-i" type="password" name="re-password" placeholder="re-enter password" />
        <input class="submit" type="submit" value="Submit">
    </form>
</div>
<Footer></Footer>

<style>
/* order is M C I */

.grid {
    place-items: center;
}

.reg-c {
    display: grid;
    padding: 5rem;
    background-color:#393B3D;
    grid-gap: 1.5rem;
    border-radius: 1rem;
}

.title {
    color: white;
    text-align: center;
}

#reg-i {
    text-align: center;
    background-color: #f0f0f0;
    border-radius: 0.2rem;
    border: none;
    outline: none;
}

</style>