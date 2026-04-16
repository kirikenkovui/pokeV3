<script setup>
import { ref } from "vue";

let link = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
let locLink = "https://pokeapi.co/api/v2/location-area?limit=20&offset=0";

const data = ref([]);
const locData = ref([]);
const isLoading = ref(false);
const isLoadingLoc = ref(false);

async function fetchData(linkHere) {
    if (isLoading.value || !link) return;
    isLoading.value = true;
    try {
        const responce = await fetch(linkHere);
        const newData = await responce.json();
        link = newData.next;

        const newItems = await fetchPokemon(newData.results);

        data.value.push(...newItems);
    } catch (err) {
        console.log("arar: " + err);
    } finally {
        isLoading.value = false;
        localStorage.removeItem("pokemon_data");
        localStorage.setItem("pokemon_data", JSON.stringify(data.value));
    }
}

async function fetchPokemon(pokemonList) {
    const promises = pokemonList.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const fullData = await response.json();

        return {
            id: fullData.id,
            name: fullData.name,
            weight: fullData.weight,
            height: fullData.height,
            abilities: fullData.abilities.map(
                (ability) => ability.ability.name,
            ),
            img: fullData.sprites.other["official-artwork"].front_default,
            type: fullData.types[0].type.name,
        };
    });

    const results = await Promise.all(promises);
    return results;
}

async function fetchLocs() {
    if (isLoadingLoc.value || !locLink) return;
    isLoadingLoc.value = true;
    try {
        const responce = await fetch(locLink);
        const fullData = await responce.json();

        locLink = fullData.next;

        const newItems = await fetchLoc(fullData.results);
        locData.value = newItems;
    } catch (er) {
        console.log("location fetch error: " + er);
    } finally {
        isLoadingLoc.value = false;
    }
}

async function fetchLoc(locationList) {
    const promises = locationList.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const fullData = await response.json();

        return {
            name: fullData.names[0].name,
            pokemons: fullData.pokemon_encounters.map((encounter) => {
                return {
                    name: encounter.pokemon.name,
                    url: encounter.pokemon.url,
                };
            }),
        };
    });

    const results = await Promise.all(promises);
    return results;
}

const dataFromLC = localStorage.getItem("pokemon_data");
if (dataFromLC) {
    data.value = JSON.parse(dataFromLC);

    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${data.value.length}`;
} else {
    fetchData(link);
    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${fetchData}`;
}

fetchLocs();
</script>

<template>
    <div class="cards-wrap">
        <div v-for="loc in locData" class="card">
            <div class="card-name">{{ loc.name }}</div>
        </div>
        <div class="button-wrap">
            <button
                :disabled="isLoading"
                class="load-button"
                @click="fetchLocs()"
            >
                <span v-if="isLoadingLoc">Loading...</span
                ><span v-else>Next locations</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.cards-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: row wrap;
    width: 80vw;
    background-color: #fff;
    margin: 0 12rem;
    border-radius: 9px;
    padding: 1rem;
}
.card {
    width: 17em;
    height: 20em;
    border: solid black 3px;
    border-radius: 9px;
    margin: 1rem;
    padding: 1rem;
}
.card-name {
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
}
.button-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 4rem;
    padding: 2rem 0;
}
.load-button {
    border: none;
    font-weight: 900;
    color: white;
    background-color: #5494d8;
    width: 18rem;
    height: 4em;
    border-radius: 100px;
}
.load-button span {
    font-size: 1.3rem;
}
</style>
