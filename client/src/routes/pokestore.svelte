<script>
import { onMount } from "svelte";
import {fetchPokemon, pokemon} from "../stores/pokestore"

onMount(() => {
    fetchPokemon()
})
</script>
{#if false}<slot/>{/if}

<h1>Pokemon Test</h1>
{#each $pokemon as pokemon}
<p>{pokemon.name}</p>
{/each}