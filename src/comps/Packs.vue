<script setup>
import { ref } from "vue";

let link = "https://pokeapi.co/api/v2/pokemon?limit=72&offset=0";
let isLoading = ref(false);
const data = ref([]);

const gottenCards = ref([]);
const cards = ref([]);

const isOpening = ref(false);

const dataFromLC = localStorage.getItem("pokemon_data");
if (dataFromLC) {
    data.value = JSON.parse(dataFromLC);

    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${data.value.length}`;
} else {
    fetchData("https://pokeapi.co/api/v2/pokemon?limit=120&offset=0");
}

const cardsFromLC = localStorage.getItem("cards");
if (cardsFromLC) {
    cards.value = JSON.parse(cardsFromLC);
}

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
            chance: fullData.weight + fullData.height,
        };
    });

    const results = await Promise.all(promises);
    return results;
}

function saveCardsToLC() {
    localStorage.setItem("cards", JSON.stringify(cards.value));
}

function openPack(amount) {
    if (isOpening.value) return;
    isOpening.value = true;

    for (let i = 0; i < amount; i++) {
        let foundCard = false;

        while (!foundCard) {
            const curCard = data.value[Math.floor(Math.random() * data.value.length)];

            if (curCard.type !== "normal") {
                if (Math.random() <= 0.9) continue;
            }

            gottenCards.value.push(curCard);
            foundCard = true;
        }
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getOwnedCount(id) {
    return cards.value.filter((c) => c.id === id).length;
}
</script>

<template>
    <h1>Open Packs!!!</h1>
    <div v-if="!isOpening" class="pack-wrap">
        <div id="pack1" @click="openPack(1)" class="pack">1 Card</div>
        <div id="pack3" @click="openPack(3)" class="pack">3 Cards</div>
        <div id="pack5" @click="openPack(5)" class="pack">5 Cards</div>
    </div>
    <div v-if="isOpening">
        <div class="cards-wrap">
            <div class="card" v-for="pokemon in gottenCards" :key="pokemon.id">
                <div class="card-status" :class="{ 'status-new': getOwnedCount(pokemon.id) === 0, 'status-owned': getOwnedCount(pokemon.id) > 0 }">
                    {{ getOwnedCount(pokemon.id) === 0 ? 'New!' : `Owned: ${getOwnedCount(pokemon.id)}` }}
                </div>
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
            <button
                class="load-button"
                @click="
                    isOpening = false;
                    cards.push(...gottenCards);
                    gottenCards = [];
                    saveCardsToLC()
                "
            >
                <span>Add to album</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
h1 {
    text-align: center;
    font-size: 4rem;
}
.pack-wrap {
    display: flex;
    justify-content: space-evenly;
}
.pack {
    border: 1px black solid;
}
.pack {
    padding: 1rem;
    font-size: 2rem;
    width: 25rem;
    height: 40rem;
    border: 3px solid #222;
    border-radius: 10px;
    color: white;
    font-weight: 900;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 3rem;
}
#pack1{
    background: #3c7da3;
    background: linear-gradient(157deg, rgba(60, 125, 163, 0.88) 0%, rgba(42, 37, 143, 0.87) 77%);
}
#pack3{
    background: #3c8ba3;
    background: linear-gradient(300deg, rgba(60, 139, 163, 0.88) 1%, rgba(120, 199, 30, 0.87) 100%);
}
#pack5{
    background: #833AB4;
    background: linear-gradient(330deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
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
.cards-wrap {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-items: center;
    gap: 1.5rem;
    background-color: white;
    padding-top: 4rem;
    padding-bottom: 4rem;
}
.card {
    font-size: 2rem;
    width: 9em;
    height: 13em;
    border: 3px solid #222;
    border-radius: 6px;
    position: relative;
}
.card-status {
    position: absolute;
    top: -10px;
    right: -10px;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.status-new {
    background-color: #ffcc00;
    color: #333;
}
.status-owned {
    background-color: #888;
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
</style>
