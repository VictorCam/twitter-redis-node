<script>
    import { s_register } from '../stores/store'
    import Navbar from '../components/Navbar.svelte'
    import Register from '../components/Register.svelte'
    import Footer from '../components/Footer.svelte'
    const s_url = import.meta.env.VITE_URL

    //
    async function redirect(e) {
        s_register.set('is-active')
        goto("/register")
    }

    // axios.interceptors.request.use(function (config) {
    //     config.headers['csrf-token'] = localStorage.getItem('csrf')
    //     return config;
    // }, function (error) {
    //     // Do something with request error
    //     return Promise.reject(error);
    // });
</script>

<Navbar></Navbar>
<Register></Register>

<section class="hero">
    <div class="hero-body">
        <div class="container has-text-centered">
            <h1 class="title">
                <strong>Box</strong>
            </h1>
            <!-- <h2 class="subtitle">
                A new way to create, support, and share content around the world.
            </h2> -->
            <h2 class="subtitle"> Hardware in a Cardboard Box</h2>
        </div>
    </div>
</section>


<!-- a simple button in the center of the page that triggers a function -->
<button on:click="{e => redirect(e)}">register route</button>

<Footer></Footer>

<style>
/* https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51 */

</style>