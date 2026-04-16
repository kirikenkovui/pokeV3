<script setup>
import { ref } from "vue";
import { computed } from "vue";
const showData = ref(false);

const pokeSearch = ref("");
const typeSearch = ref("");

//fetching
let link = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";
let isLoading = ref(false);
const data = ref([]);
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const filteredList = computed(() => {
  const name = pokeSearch.value.toLowerCase().trim();

  return data.value.filter((pokemon) => {
    const matchesName = pokemon.name.includes(name);
    const matchesType = !typeSearch.value || pokemon.type==typeSearch.value;
    return matchesName && matchesType;
  });
});

const dataFromLC = localStorage.getItem("pokemon_data");
if(dataFromLC){
  data.value = JSON.parse(dataFromLC)

  link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${data.value.length}`;
}
else{
  fetchData(link)
  link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${fetchData}`;
}


</script>

<template>
<div class="wrap">
    <div class="filter-wrap">
        <div class="input-wrap">
            <label>Search by name: </label>
            <input v-model="pokeSearch"></input>
        </div>
        <div class="select-wrap">
            <label>Search by tags:</label>
            <select v-model="typeSearch">
                <option value="">None</option>
                <option value="grass">Grass</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="bug">Bug</option>
                <option value="normal">Normal</option>
                <option value="poison">Poison</option>
                <option value="electric">Electric</option>
                <option value="ground">Ground</option>
                <option value="fairy">Fairy</option>
                <option value="fighting">Fighting</option>
                <option value="psychic">Psychic</option>
                <option value="rock">Rock</option>
                <option value="ghost">Ghost</option>
                <option value="ice">Ice</option>
                <option value="dragon">Dragon</option>
                <option value="dark">Dark</option>
                <option value="steel">Steel</option>
            </select>
        </div>
    </div>
    <div class="cards-wrap">
        <div class="card" v-for="pokemon in filteredList">
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
        <button :disabled="isLoading" class="load-button" @click="fetchData(link)"><span v-if="isLoading">Loading...</span><span v-else>Load more</span></button>
    </div>
</div>
    <div class="data-wrap">
        <a class="showDataA" href="" @click.prevent="showData=!showData">Show data</a>
        <pre v-if="showData">
            {{filteredList}}
        </pre>
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
.filter-wrap{
    display: flex;
    flex-flow: row wrap;
}
.input-wrap{
    padding: 2rem;
}
.input-wrap input{
    border: none;
    border-radius: 30px;
    padding-left: 1rem;
    color: white;
    background: #DFDFDF;
    height: 2rem;
    transition: 0.3s;
}
.input-wrap input:hover{
    background: #BCBCBC
}
.select-wrap{
    padding: 2rem;
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
.button-wrap{
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 4rem;
    padding: 2rem 0 ;
}
.load-button{
    border: none;
    font-weight: 900;
    color: white;
    background-color: #5494d8;
    width: 18rem;
    height: 4em;
    border-radius: 100px;
}
.load-button span{
    font-size: 1.3rem;
}
.data-wrap{
    width: 100%;
    display: flex;
    justify-content: start;
    flex-flow: row wrap;
    padding: 2rem;
}
.showDataA{
    color: #CCC;
}

</style>
