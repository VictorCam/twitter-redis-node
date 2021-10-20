import {writable} from 'svelte/store'
import axios from 'axios'

var pokemon = writable([])

async function fetchPokemon() {
    var test = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=10')
    pokemon.set(test.data.results)
}

export {pokemon, fetchPokemon}