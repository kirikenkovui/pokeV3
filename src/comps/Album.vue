<script setup>
import { ref, computed } from "vue";

const cards = ref([]);
const showData = ref(false);
const cardsFromLC = localStorage.getItem("cards");
if (cardsFromLC) {
    const parsed = JSON.parse(cardsFromLC);
    const flattened = [];

    parsed.forEach((item) => {
        if (item && typeof item === "object" && item.id) {
            flattened.push(item);
        } else if (item && typeof item === "object") {
            for (const key in item) {
                if (!isNaN(key) && item[key] && item[key].id) {
                    flattened.push(item[key]);
                }
            }
        }
    });

    cards.value = flattened;
    // Save to localStorage
    localStorage.setItem("cards", JSON.stringify(flattened));
}

function capitalize(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// sorting of the cards, so we won't see 2 same cards
const addedCards = computed(() => {
    const counts = {};

    cards.value.forEach((card) => {
        // make set of the object
        counts[card.name] = (counts[card.name] || 0) + 1;
    });

    const uniqueCards = [];
    const seen = new Set();

    for (const card of cards.value) {
        if (!seen.has(card.name)) {
            seen.add(card.name);
            uniqueCards.push({
                ...card,
                count: counts[card.name],
            });
        }
    }

    return uniqueCards;
});
</script>

<template>
    <h1>Your Album</h1>
    <div class="cards-wrap">
        <div
            v-if="addedCards.length > 0"
            class="card"
            v-for="pokemon in addedCards"
            :key="pokemon.id"
        >
            <RouterLink :to="'detail/' + pokemon.id.toString()">
                <div class="card-name">{{ capitalize(pokemon.name) }}</div>
                <div class="card-id">#{{ ("000" + pokemon.id).slice(-4) }}</div>
                <!--   3 => #0003   -->
                <div class="card-img-wrap">
                    <img
                        class="card-img"
                        :src="pokemon.img"
                        :alt="pokemon.name"
                    />
                </div>
                <div class="type-wrap">
                    <div class="type" :class="pokemon.type">
                        {{ capitalize(pokemon.type) }}
                    </div>
                </div>
                <div id="card-count" class="card-id" v-if="pokemon.count > 1">
                    You have this card {{ pokemon.count }} times
                </div>
            </RouterLink>
        </div>
        <div v-else>
            You do not have any pokemons yet try opening
            <RouterLink class="link" to="/packs">packs</RouterLink>
        </div>
    </div>
    <div class="data-wrap">
        <a class="showDataA" href="" @click.prevent="showData = !showData"
            >Show data</a
        >
        <pre v-if="showData">
            {{ addedCards }}
        </pre>
    </div>
</template>

<style scoped>
h1 {
    text-align: center;
    font-size: 3rem;
}
.cards-wrap {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    align-items: center;
    gap: 1.5rem;
    background-color: white;
    padding-top: 4rem;
    width: 80vw;
    margin: 0 auto;
    border-radius: 9px;
    padding-bottom: 4rem;
}
.card {
    font-size: 2rem;
    width: 9.5em;
    height: 14em;
    border: 3px solid #222;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    padding-bottom: 0.3rem;
}
.card a {
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
.card-id {
    color: #aaa;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    text-align: center;
    padding: 0 0.5rem;
}
.card-img-wrap {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}
.card-img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
}
.type-wrap {
    display: flex;
    justify-content: center;
    padding-bottom: 1rem;
}
.type {
    font-size: 1rem;
    font-weight: bold;
}
.data-wrap {
    width: 100%;
    display: flex;
    justify-content: start;
    flex-flow: row wrap;
    padding: 2rem;
}
.showDataA {
    color: #ccc;
}
</style>
