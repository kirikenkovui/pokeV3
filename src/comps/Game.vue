<script setup>
import { ref, onMounted } from "vue";

const data = ref([]);
const showData = ref(false);
const rowTypes = ref([]);
const colAbilities = ref([]);
const grid = ref([]);
const isLoading = ref(false);

const TOTAL_POKEMON_REQUIRED = 150;

async function fetchPokemon(pokemonList) {
    const promises = pokemonList.map(async (pokemon) => {
        const response = await fetch(pokemon.url);
        const fullData = await response.json();
        return {
            id: fullData.id,
            name: fullData.name,
            weight: fullData.weight,
            height: fullData.height,
            abilities: fullData.abilities.map((a) => a.ability.name),
            img: fullData.sprites.other["official-artwork"].front_default,
            type: fullData.types[0].type.name,
        };
    });
    return await Promise.all(promises);
}

async function loadData() {
    isLoading.value = true;
    const LSData = localStorage.getItem("pokemon_data");
    if (LSData) {
        data.value = JSON.parse(LSData);
    }

    if (data.value.length < TOTAL_POKEMON_REQUIRED) {
        const deficit = TOTAL_POKEMON_REQUIRED - data.value.length;
        const link = `https://pokeapi.co/api/v2/pokemon?limit=${deficit}&offset=${data.value.length}`;
        try {
            const response = await fetch(link);
            const newData = await response.json();
            const newItems = await fetchPokemon(newData.results);
            data.value.push(...newItems);
            localStorage.setItem("pokemon_data", JSON.stringify(data.value));
        } catch (err) {
            console.error(err);
        }
    }

    isLoading.value = false;
    generateBoard();
}

function initGrid() {
    grid.value = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => ({
            input: "",
            solved: false,
            error: false,
            focused: false,
            pokemon: null,
        }))
    );
}

function getSuggestions(input) {
    if (!input) return [];
    const lowerInput = input.toLowerCase();
    return data.value
        .filter((p) => p.name.toLowerCase().includes(lowerInput))
        .slice(0, 5);
}

function selectSuggestion(r, c, name) {
    grid.value[r][c].input = name;
    grid.value[r][c].focused = false;
    guessPokemon(r, c);
}

function getUniqueTypes(list) {
    return [...new Set(list.map((p) => p.type).filter(Boolean))];
}

function getUniqueAbilities(list) {
    const abilities = new Set();
    list.forEach((p) => p.abilities?.forEach((a) => abilities.add(a)));
    return [...abilities];
}

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function validateCell(type, ability) {
    return data.value.some((p) => p.type === type && p.abilities.includes(ability));
}

function generateBoard() {
    initGrid();
    if (!data.value.length) return;

    const allTypes = getUniqueTypes(data.value);
    const allAbilities = getUniqueAbilities(data.value);

    let bestTypes = [];
    let bestAbilities = [];
    let bestScore = -1;

    for (let attempts = 0; attempts < 1000; attempts++) {
        const randomTypes = shuffle(allTypes).slice(0, 3);
        const randomAbilities = shuffle(allAbilities).slice(0, 3);

        let score = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (validateCell(randomTypes[r], randomAbilities[c])) score++;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestTypes = randomTypes;
            bestAbilities = randomAbilities;
        }

        if (bestScore === 9) break;
    }

    rowTypes.value = bestTypes;
    colAbilities.value = bestAbilities;
}

function guessPokemon(r, c) {
    const cell = grid.value[r][c];
    if (cell.solved) return;

    const guessName = cell.input.toLowerCase().trim();
    if (!guessName) return;

    const targetType = rowTypes.value[r];
    const targetAbility = colAbilities.value[c];

    const match = data.value.find(
        (p) =>
            p.name.toLowerCase() === guessName &&
            p.type === targetType &&
            p.abilities.includes(targetAbility)
    );

    if (match) {
        cell.solved = true;
        cell.error = false;
        cell.pokemon = match;
    } else {
        cell.error = true;
        setTimeout(() => (cell.error = false), 1000);
    }
}

function capitalize(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}

onMounted(() => {
    loadData();
});
</script>

<template>
    <div class="all-wrap">
        <h2 class="title">Pokedoku</h2>

        <div v-if="isLoading" class="loading">Loading Pokemon...</div>

        <div v-else class="game-container">
            <div class="board">
                <div class="cell header empty"></div>

                <div
                    class="cell header col-header"
                    v-for="ability in colAbilities"
                    :key="'col-' + ability"
                >
                    {{ capitalize(ability) }}
                </div>

                <template v-for="(type, r) in rowTypes" :key="'row-' + type">
                    <div class="cell header row-header" :class="type">
                        {{ capitalize(type) }}
                    </div>

                    <div
                        class="cell board-cell"
                        v-for="(ability, c) in colAbilities"
                        :key="'cell-' + r + '-' + c"
                    >
                        <div
                            v-if="grid[r][c].solved"
                            class="solved-card"
                            :class="type"
                        >
                            <img
                                :src="grid[r][c].pokemon.img"
                                :alt="grid[r][c].pokemon.name"
                                class="solved-img"
                            />
                            <span class="solved-name">{{
                                capitalize(grid[r][c].pokemon.name)
                            }}</span>
                        </div>

                        <div v-else class="input-wrap">
                            <input
                                v-model="grid[r][c].input"
                                @keyup.enter="guessPokemon(r, c)"
                                @focus="grid[r][c].focused = true"
                                @blur="grid[r][c].focused = false"
                                placeholder="?"
                                :class="{ error: grid[r][c].error }"
                                spellcheck="false"
                            />

                            <div class="suggestions" v-if="grid[r][c].focused && grid[r][c].input.length > 0">
                                <div
                                    class="suggestion-item"
                                    v-for="sugg in getSuggestions(grid[r][c].input)"
                                    :key="sugg.id"
                                    @mousedown.prevent="selectSuggestion(r, c, sugg.name)"
                                >
                                    {{ capitalize(sugg.name) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div class="button-container">
                <button @click="generateBoard" class="restart-btn">
                    New Board
                </button>
            </div>
        </div>
    </div>
    <div class="data-wrap">
        <a
            class="showdata-a"
            style="color: #ccc; padding: 2rem"
            href=""
            @click.prevent="showData = !showData"
            >Show data</a
        >
        <pre class="data" v-if="showData">
            {{ data }}
        </pre>
    </div>
</template>

<style scoped>
.all-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 0;
    margin: 2%;
    background: white;
    border-radius: 9px;
    min-height: 80vh;
}

.title {
    font-size: 3rem;
    margin-bottom: 2rem;
    font-weight: bold;
}

.loading {
    font-size: 1.5rem;
    color: #666;
}

.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.board {
    display: grid;
    grid-template-columns: 120px 150px 150px 150px;
    grid-template-rows: 60px 150px 150px 150px;
    gap: 10px;
    background-color: #333;
    padding: 10px;
    border-radius: 12px;
}

.cell {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: #f5f5f5;
    overflow: hidden;
}

.header {
    font-weight: bold;
    font-size: 1.1rem;
    text-align: center;
    background-color: #e0e0e0;
}

.empty {
    background-color: transparent;
}

.col-header {
    background-color: #d1d1d1;
}

.row-header {
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.board-cell {
    background-color: #fff;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

.input-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    position: relative;
}

.suggestions {
    position: absolute;
    top: calc(50% + 25px); /* Just below the input */
    left: 5%;
    width: 90%;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 150px;
    overflow-y: auto;
}

.suggestion-item {
    padding: 8px 10px;
    cursor: pointer;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background-color: #f0f8ff;
    color: #5494d8;
}

.input-wrap input {
    width: 90%;
    height: 40px;
    font-size: 1.2rem;
    text-align: center;
    border: 2px solid #ccc;
    border-radius: 6px;
    outline: none;
    transition: all 0.2s;
}

.input-wrap input:focus {
    border-color: #5494d8;
    box-shadow: 0 0 5px rgba(84, 148, 216, 0.5);
}

.input-wrap input.error {
    border-color: #ff4d4f;
    background-color: #fff1f0;
    animation: shake 0.4s;
}

.solved-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #f0f8ff;
}

.solved-img {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.solved-name {
    font-weight: bold;
    font-size: 1rem;
    margin-top: 5px;
}

.button-container {
    margin-top: 2rem;
}

.restart-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: white;
    background-color: #5494d8;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.restart-btn:hover {
    background-color: #3b7cbd;
}

@keyframes shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    50% {
        transform: translateX(5px);
    }
    75% {
        transform: translateX(-5px);
    }
}

/* Add type colors for row headers if needed */
.grass {
    background-color: #78c850;
}
.fire {
    background-color: #f08030;
}
.water {
    background-color: #6890f0;
}
.bug {
    background-color: #a8b820;
}
.normal {
    background-color: #a8a878;
}
.poison {
    background-color: #a040a0;
}
.electric {
    background-color: #f8d030;
}
.ground {
    background-color: #e0c068;
}
.fairy {
    background-color: #ee99ac;
}
.fighting {
    background-color: #c03028;
}
.psychic {
    background-color: #f85888;
}
.rock {
    background-color: #b8a038;
}
.ghost {
    background-color: #705898;
}
.ice {
    background-color: #98d8d8;
}
.dragon {
    background-color: #7038f8;
}
.dark {
    background-color: #705848;
}
.steel {
    background-color: #b8b8d0;
}
.flying {
    background-color: #a890f0;
}
</style>
