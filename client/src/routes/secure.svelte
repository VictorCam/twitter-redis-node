<script context="module">
export const load = ({session}) => {
    if(!session.auth) return { status: 301, redirect: `/login` }
    return {}
}
</script>

<script>
import Header from '../components/Header.svelte'
</script>

<style>
</style>

<Header/>
<h1>Secure ROUTE</h1>
<!-- {JSON.stringify(session)} -->