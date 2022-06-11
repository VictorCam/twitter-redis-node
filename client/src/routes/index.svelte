<script>
    import { sum_toggle, modal } from '../stores/store_root'
    import Navbar from '../components/Navbar.svelte'
    import Register from '../components/RegisterModal.svelte'
    import Signup from '../components/Register.svelte'
    import Footer from '../components/Footer.svelte'
    const s_url = import.meta.env.VITE_URL

    async function api(e) {
        console.log("entered")

        sum_toggle.set('is-active')
        goto("/register")

        //with credentials
        let res = await axios.get(s_url, { withCredentials: true })
        console.log(res.data)

        
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
<button on:click="{e => api(e)}">register route</button>

<Footer></Footer>

<style>
/* import bulma */
@import 'bulma/css/bulma.css';

/* import divider */
/* @import 'bulma-extensions/bulma-divider/dist/css/bulma-divider.min.css'; */

/* https://coolors.co/palette/264653-2a9d8f-e9c46a-f4a261-e76f51 */


</style>