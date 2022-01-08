<template>
    <div class="collections">
      <div class="header">
        <h1>My Forces</h1>
        <div class="element-horizontal">
            <select id="forcesFilter" v-model="forceName" size="5">
                <option v-for="name in myForces.map( force => force.name )" :key="name" :value="name">{{name}}</option>
            </select>
          <button id="loadForceBtn" @click="() => setMyForce(forceName)">Open</button>
        </div>
        <div>
          <input type="text" v-model="newForceName" id="newForceName"/>
        </div>
        <div>
          <button id="newForceBtn" @click="() => setMyForce(newForceName)">Create</button>
        </div>
      </div>
    </div>
</template>

<script>
import 'es6-promise/auto';
import {
  getCollection,
  saveCollection,
} from '@/firebase';

export default {
    name: 'MyForcesSelector',
    data() {
        return {
          forceName: '',
          newForceName: '',
          myForces: [],
        };
    },
    async mounted() {
      this.myForces = await getCollection('forces') || [];
    },
    methods: {
        setMyForce(name) {
          this.myForce = this.myForces.filter(force => force.name == name)[0];

          if (this.myForce === undefined) {
            this.myForces.push({name, slots: {}});
            this.newForceName = '';
          }
          if (name !== undefined && name.trim() !== '') {
            saveCollection('forces', this.myForces);
            this.$router.push(`/my-forces?name=${encodeURI(name)}`);
          }
        },
    },
};
</script>

<style scoped>
  input {
    width: 5em;
  }

  input#newForceName {
    width: 15em;
  }


  button {
    width: 10em;
    height: 3em;
  }

  .collections {
    width: 100%;
    display: grid;
    align-content: center;
    justify-items: center;
    align-items: center;
  }

  .collections .header {
    width: 100%;
    position: sticky;
    display: grid;
    justify-items: center;
    gap: .5em;
  }

  .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding-bottom: .5em;
  }

  .element-horizontal {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-template-rows: 1fr 1fr;
    padding-bottom: .5em;
  }

  .element-horizontal > button {
    font-weight: bold;
    justify-self: center;
    align-self: center;
    padding: .1em;
  }

  .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: center;
    padding-right: .5em;
  }

  .dice {
    width: 100%;
  }

  .collections .dice .header {
    margin-bottom: .75em;
    border-bottom: 1px solid black;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-weight: bold;
    align-items: center;
    justify-items: center;
  }

  .body {
    width: 100%;
    overflow: auto;
    height: 50vh;
  }

  .body .row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr auto;
    justify-items: center;
    align-items: center;
    gap: .25em;
  }

  .collections select {
    border-radius: .25em;
    width: 15em;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  .column-header {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .sort-icon {
    font-size: 24px;
  }

  .die-id {
    grid-column: 1;
    grid-row: 1;
    display: grid;
    text-align: center;
    justify-items: center;
    width: 25%;
  }

  .size {
    grid-column: 2;
    grid-row: 1;
    width: 25%;
  }

  .type {
    grid-column: 3;
    grid-row: 1;
    width: 25%;
  }

  .add-die {
    grid-auto-flow: column;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-content: center;
    align-content: center;
    justify-items: start;
    align-items: center;
    gap: .5em;
    padding-left: 1.0em;
  }

   #expansion {
    display: none;
    grid-area: 2 / 1 / 2 / 5;
    width: 100%;
    border: 1px dashed black;
  }

  .add-button {
    grid-column: 4;
    grid-row: 1;
    font-size: 24px;
    width: 25%;
  }

  @media screen and (max-width: 480px) {
    .die-id {
      width: 8em;
    }

    .size {
      width: 5em;
    }

    .type {
      width: 5em;
    }
  }

</style>