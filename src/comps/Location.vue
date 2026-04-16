<script setup>
import { ref } from "vue";

let link = "https://pokeapi.co/api/v2/pokemon?limit=12&offset=0";

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

const dataFromLC = localStorage.getItem("pokemon_data");
if (dataFromLC) {
    data.value = JSON.parse(dataFromLC);

    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${data.value.length}`;
} else {
    fetchData(link);
    link = `https://pokeapi.co/api/v2/pokemon?limit=12&offset=${fetchData}`;
}
</script>
<template>
    <div>Location</div>
    <pre>{{ data }}</pre>
</template>
<style scoped></style>
