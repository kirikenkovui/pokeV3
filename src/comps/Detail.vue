<script setup>
import { toNumber } from "@vue/shared";
import { ref } from "vue";
import { useRoute } from "vue-router";

let thisID = useRoute().params.id;
let lastID = 0;
const data = ref();
const showData = ref(false);

function getDataFromLS(targetID) {
    let LSData = localStorage.getItem("pokemon_data");
    if (LSData) {
        const allData = JSON.parse(LSData);
        lastID = allData[allData.length - 1].id;
        const match = allData.find(obj => obj.id == targetID);
        data.value = match;
    }
}
getDataFromLS(thisID);


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

</script>

<template>
    <div class="wrap">
            <div class="card-name">{{capitalize(data.name) }}</div>
            <div class="card-id">#{{("000" + data.id).slice(-4)}}</div> <!--   3 => #0003   -->
            <div class="centre-wrap">
                <div class="card-img-wrap">
                    <img class="card-img" :src="data.img" :alt="data.name"></img>
                </div>
                <div class="stats-wrap">
                    <div class="weight">
                        Weight: {{data.weight/10}}kg
                    </div>
                    <div class="heigt">
                        Height: {{data.height/10}}m
                    </div>
                    <div style="margin-bottom: 0;">
                        Abilities:
                    </div>
                </div>
                <div class="abilities-wrap">
                    <div v-for="(ability) in data.abilities">
                        {{capitalize(ability)}}
                    </div>
                </div>
                <div  class="type-wrap">
                    <div id="type-wraper" class="type" :class="data.type">{{capitalize(data.type)}}</div>
                </div>
        </div>
        <div class="buttons-wrap">
            <button :disabled="thisID==1" @click="thisID--; getDataFromLS(thisID)" class="button"><- Previus pokemon</button>
            <RouterLink  to="/"><button class="button">List</button></RouterLink>
            <button :disabled="thisID==lastID" @click="thisID++; getDataFromLS(thisID)" class="button">Next pokemon -></button>
        </div>
    </div>
        <div class="data-wrap">
            <a class="showdata-a" href="" @click.prevent="showData = !showData"
                >Show data</a
            >
            <pre class="data" v-if="showData">
                {{ data }}
            </pre>
        </div>
</template>

<style scoped>
#type-wraper{
    width: 30%;
    margin: 2rem auto
}
.wrap {
    width: 40%;
    height: 75vh;
    margin: 0 30%;
    border-radius: 8px;
    padding: 2rem;
    background: white;
}
.centre-wrap{
    margin:2rem 0 ;
}
.card-name{
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 3rem;
    font-weight: 900;
    letter-spacing: 0.3rem;
}
.card-id{
    display: flex;
    justify-content: center;
    align-items: center;
    color: #868686;
    font-size: 1.2rem;
}
.card-img-wrap{
    float: left;
    margin: 0 1rem
}
.abilities{
    font-size:1rem;
}
.stats-wrap div{
    font-size: 2rem;
    margin: 1rem auto
}
.buttons-wrap{
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    width: 100%;

    height: 20%;

}
.button{
    width: 13em;
    height: 5em;
    border: none;
    border-radius: 10px;
    background: #3889d1
}
.data-wrap pre {
    display: flex;
    flex-flow: row wrap;
}
.showdata-a {
    color: #CCC;
}
</style>
