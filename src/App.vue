<script setup>
import { ref } from "vue";
// import { RouterView } from "vue-router";
</script>

<template>
    <nav>
        <RouterLink class="link" to="/">List</RouterLink
        ><RouterLink class="link" to="/game">Game</RouterLink>
    </nav>
    <!-- <h1 class="name">Poke v2</h1> -->
    <main>
        <RouterView />
    </main>
</template>

<style scoped>
h1 {
    text-align: center;
}
nav {
    display: flex;
    flex-flow: row-reverse;
    background: white;
    padding: 0 1rem;
    width: 100wv;
    margin-bottom: 5rem;
}
.link {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    color: black;
    text-decoration: none;
    transition: 0.3s;
}
.link:hover {
    background: #dfdfdf;
}
#app {
    display: flex;
    justify-content: center;
}
.name {
    font-size: 3rem;
    font-weight: 900;
    color: white;
}
</style>
