<script>
    async function test(e) {
        goto("/")
    }
</script>

<!-- <Register></Register> -->

<button on:click="{e => test(e)}">Click me</button>