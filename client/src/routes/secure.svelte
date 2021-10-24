<script context="module">
export const load = ({session}) => {
    if(!session.auth) return { status: 301, redirect: `/login` }
    return {}
}
</script>

<style>
</style>
{#if false}<slot/>{/if}

<h1>Secure ROUTE</h1>
<!-- {JSON.stringify(session)} -->