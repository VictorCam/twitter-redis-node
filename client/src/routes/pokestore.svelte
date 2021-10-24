<script>
import { onMount } from "svelte";
import {fetchPokemon, pokemon} from "../stores/pokestore"


// https://svelte.dev/repl/3011c3a4416c43018c82fcfac875bf60?version=3.38.2
// onMount(() => {
//     fetchPokemon()
// })
fetchPokemon()
</script>
{#if false}<slot/>{/if}

<h1>Pokemon Test</h1>
{#each $pokemon as pokemon}
<p>{pokemon.name}</p>
{/each}