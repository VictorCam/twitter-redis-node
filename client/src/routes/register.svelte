<script>
import { onMount } from "svelte";
import {register, registerapi} from "../stores/auth"

onMount(() => {
})

async function validate(e) {
    console.log("triggered register form")
    registerapi(e.target)
}
</script>

<style>
</style>
{#if false}<slot/>{/if}

<h1>Register</h1>
<div>
    <form on:submit|preventDefault={validate} class="register">
    <input type="text" name="username" placeholder="username, email, or phone"/>
    <input type="password" name="password" placeholder="password" />
    <input type="submit" value="Submit">
</form>
</div>