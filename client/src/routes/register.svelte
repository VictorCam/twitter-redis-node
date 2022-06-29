<script>
    import Register from '../components/Register.svelte'
    import Navbar from '../components/Navbar.svelte'
    import Footer from '../components/Footer.svelte'

    async function test(e) {
        goto("/")
    }

    let e = {
        rmodal: 'is-invisible'
    }
</script>

<Navbar></Navbar>
<button on:click="{e => test(e)}">Click me</button>
<Register></Register>
<Footer></Footer>



