<script setup>
import { ref } from "vue";

let link = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
let locLink = "https://pokeapi.co/api/v2/location?limit=20&offset=0";

const data = ref([]);
const locData = ref([]);
const isLoading = ref(false);
const isLoadingLoc = ref(false);

const locPokList = ref([]);

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
    const promises = locationList.map(async (locationItem) => {
        const response = await fetch(locationItem.url);
        const fullData = await response.json();

        let pokemons = [];
        if (fullData.areas && fullData.areas.length > 0) {
            const areaResponse = await fetch(fullData.areas[0].url);
            const areaData = await areaResponse.json();

            pokemons = areaData.pokemon_encounters.map((encounter) => {
                return {
                    name: encounter.pokemon.name,
                    url: encounter.pokemon.url,
                };
            });
        }
        return {
            name: fullData.name,
            pokemons: pokemons,
        };

    });

    const results = await Promise.all(promises);
    return results;
}

function getLocPoks(pokList) {
    let newList = [];
    pokList.forEach((pok) => {
        data.value.map((loadedPok) => {
            if (loadedPok.name == pok.name) {
                newList.push(loadedPok);
            }
        });
    });
    locPokList.value = newList;
}

const dataFromLC = localStorage.getItem("pokemon_data");
if (dataFromLC) {
    data.value = JSON.parse(dataFromLC);

    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${data.value.length}`;
} else {
    fetchData(link);
    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${fetchData}`;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


//formating name : name-name => Name Name
function formatLocName(name) {
    if (!name) return '';
    return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


fetchLocs();
</script>

<template>
    <div class="wrap">
    <!-- POKEMON LIST -->
    <div v-if="locPokList.length > 0">
    <div class="cards-wrap">
        <div v-for="pokemon in locPokList" class="card">
            <RouterLink :to="'detail/' + pokemon.id.toString()">
            <div class="card-name">{{capitalize(pokemon.name) }}</div>
             <div class="card-id">#{{("000" + pokemon.id).slice(-4)}}</div> <!--   3 => #0003   -->
            <div class="card-img-wrap">
                <img class="card-img" :src="pokemon.img" :alt="pokemon.name"></img>
            </div>
            <div class="type-wrap">
                <div class="type" :class="pokemon.type">{{capitalize(pokemon.type)}}</div>
            </div>
            </RouterLink>

        </div>
    </div>
    <div class="button-wrap">
        <button class="load-button" @click="locPokList = []">Back to list</button>
    </div>
    </div>

    <!-- LOCS LIST -->
    <div v-else class="cards-wrap">
        <div v-for="loc in locData" class="loc-card" @click="getLocPoks(loc.pokemons)">
            <div class="loc-name">{{ formatLocName(loc.name) }}</div>
                <div class="loc-encounters">{{ loc.pokemons.length }} Pokémon</div>
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
    </div>
</template>

<style scoped>
.wrap{
    width: 80vw;
    background-color: #FFF;
    margin:0 12rem;
    padding-bottom: 4rem;
    border-radius: 9px;
    padding: 1rem;
}
.cards-wrap {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-items: center;
    gap: 1.5rem;
    background-color: white;
    padding-top: 4rem;
}

.card {
    font-size: 2rem;
    width: 9em;
    height: 13em;
    border: 3px solid #222;
    border-radius: 6px;
}
.card a{
    text-decoration: none;
    color: black;
}
.card-name {
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
}
.card-id{
    color: #AAA;
    display: flex;
    justify-content: center;
    align-items: center;
}
.card-img{
    width: 100%;
}

/*
    css pre locations cards
*/
.loc-card {
    font-size: 1.5rem;
    width: 18em;
    height: 8em;
    border: 3px solid #222;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #f9f9f9;
    transition: transform 0.2s, box-shadow 0.2s;
}
.loc-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    background-color: #fff;
}
.loc-name {
    font-size: 1.8rem;
    font-weight: 800;
    text-align: center;
    padding: 0 1rem;
}
.loc-encounters {
    font-size: 1.2rem;
    color: #888;
    margin-top: 0.5rem;
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
