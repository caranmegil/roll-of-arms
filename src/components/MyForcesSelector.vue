<template>
    <div class="collections">
      <div class="header">
        <div class="element-horizontal">
            <label for="forcesFilter">Select Force</label>
            <select id="forcesFilter" v-model="forceName" size="5" @change="onChange()">
                <option v-for="name in (myForces || []).map( force => force.name )" :key="name" :selected="myForce.name === name ? 'selected' : ''" :value="name">{{name}}</option>
            </select>
        </div>
        <div class="element-horizontal"><label>OR</label></div>
        <div class="element-horizontal">
          <button id="newForceBtn" @click="$emit('onNewForce')">Create New</button>
        </div>
      </div>
    </div>
</template>

<script>
import 'es6-promise/auto';

export default {
    name: 'MyForcesSelector',
    emits: ['onForceChanged', 'onNewForce'],
    props: ['myForces', 'myForce',],
    data() {
        return {
          forceName: '',
        };
    },
    methods: {
      onChange() {
        this.$emit('onForceChanged', this.forceName);
      }
    }
};
</script>

<style scoped>
  .menu-item {
    width: 100%;
    align-content: left;
  }
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
    padding-bottom: .5em;
  }

  .element-horizontal > button {
    font-weight: bold;
    justify-self: center;
    align-self: center;
    padding: .1em;
  }

  .element-horizontal > label {
    font-weight: bold;
    justify-self: center;
    align-self: center;
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