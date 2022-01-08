<template>
    <v-tour name="forcesTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="collections">
      <div class="header">
        <h1>My Forces</h1>
        <div class="element">
            <label for="forcesFilter">Forces</label>
            <select id="forcesFilter" v-model="forceName" @change="setMyForce">
                <option value="" selected="selected">Add New...</option>
                <option v-for="name in myForces.map( force => force.name )" :key="name" :value="name">{{name}}</option>
            </select>
        </div>
        <div class="element">
          <label for="privacy">Make Public</label>
          <input type="checkbox" id="privacy" v-model="myForce.isPublic" @change="saveTheForces"/>
        </div>
        <div class="element">
          <button id="export" @click="exportCurrentForce"><span class="material-icons material-icons-outlined" style="font-size: 16px !important;">file_download</span></button>
          <label for="forceName">Force Name</label>
          <input type="text" id="forceName" v-model="myForce.name" @change="saveTheForces"/>
        </div>
        <button id="locate" @click="browseDice">Add Dice</button>
        <span id="filters">
          <div class="element">
              <label for="forceFilter">Location</label>
              <select id="forceFilter" v-model="forceSlot" @change="setForcesSlot">
                  <option value="Home" selected="selected">Home</option>
                  <option value="Horde">Horde</option>
                  <option value="Frontier">Frontier</option>
                  <option value="Summoning">Summoning</option>
              </select>
          </div>
          <div class="element"><label for="totalDice">Total Dice</label><div id="totalDice">{{totalDice}}</div></div>
        </span>

        <div class="separator"></div>
        <span class="dice">
            <div class="header">
                <div class="column-header die-id" @click="changeNameDirection">Name <span v-if="sortColumn != 0" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div class="column-header size" @click="changeSizeDirection">Size  <span v-if="sortColumn != 1" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div class="column-header type" @click="changeTypeDirection">Type  <span v-if="sortColumn != 2" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div></div>
            </div>
        </span>
      </div>
      <div class="dice">
        <div class="body">
          <div v-for="die in myForce.slots[forceSlot]" :key="die.name" :id="die.name" class="row">
              <div @click="() => expand(die)" class="die-id"><img :src="getImageID(die)"/><div>{{die.name}} ({{recalcSubTotals(die)}})</div></div>
              <div @click="() => expand(die)" class="size">{{die.rarity}}</div>
              <div @click="() => expand(die)" class="type">{{die.type}}</div>
              <div @click="() => expand(die)" class="add-button"><span id="action-button" class="material-icons material-icons-outlined">expand_more</span></div>
              <div id="expansion">
                <div class="add-die">
                  <span @click="() => decr(die)" class="material-icons material-icons-outlined">remove</span>
                  <div class="amount"><input type="number" v-model="die.amount" @keyup="() => changeAmount(die)" @change="() => changeAmount(die)"></div>
                  <span @click="() => incr(die)" class="material-icons material-icons-outlined">add</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {
  getCollection,
  saveCollection,
  getEntireCollection,
} from '@/firebase';

export default {
    name: 'DiceBrowser',
    data() {
        return {
            totalDice: '0 / 0',
            sortColumn: 0,
            sortDirection: 1,
            profile: {},
            tourCallbacks: {
              onSkip: this.noMoreTours,
              onFinish: this.noMoreTours,
            },
            steps: [
              {
                target: '#filters',
                header: {
                  title: 'Filters!',
                },
                content: 'Set your area of forces filters here.',
              },
              {
                target: '#locate',
                header: {
                  title: 'Add Die!',
                },
                content: 'Press this button to locate dice to add using the forces dice browser.',
              },
              {
                target: '.body',
                header: {
                  title: 'The Dice!',
                },
                content: 'Scroll through this list and locate the die you want and modify your forces.  Changing the amount to 0 removes it.',
                params: {
                  placement: 'auto',
                },
              },
            ],
            sourceDice: [],
            myForces: [],
            myForce: {slots: {'Home': [], 'Horde': [], 'Frontier': [], 'Summoning': []}},
            diceGroupedByEdition: {},
            filteredDice: [],
            forceName: "",
            forceSlot: 'Home',
            timerHandle: null,
        };
    },
    async mounted() {
      let that = this;
      this.sourceDice = await getEntireCollection('dice');
      this.myForces = await getCollection('forces') || [];
      if (this.$route.query.name !== undefined) {
        this.myForce = this.myForces.filter(force => force.name === that.$route.query.name)[0] || {};
      } else {
        this.myForce = {name: this.name, slots: {'Home': [], 'Horde': [], 'Frontier': [], 'Summoning': []}};
      }

      this.profile = await getCollection('profiles') || {};
      if (this.profile.forcesTour || this.profile.forcesTour === undefined) {
        this.$tours['forcesTour'].start();
      }

      if (this.myForce.isPublic === undefined) {
        this.myForce.isPublic = false;
      }

      this.forceSlot = this.$store.state.forceSlot || 'Home';
      
      this.timerHandle = setInterval(this.saveAndClear, 5000);
    },
    unmounted() {
      this.saveAndClear();
      clearInterval(this.timerHandle);
    },
    methods: {
        ...mapActions(['setForceSlot', 'setFilters']),
        decr(die) {
          if (die.amount > 0) {
            die.amount--;
          }
        },
        incr(die) {
          die.amount++;
        },
        expand(die) {
          let row = document.getElementById(die.name);
          let actionButton = row.querySelector('#action-button');
          let expansion = row.querySelector('#expansion');
          let allExpansions = document.querySelectorAll('#expansion');
          this.edAmnt = 0;

          if (window.getComputedStyle(expansion).display === 'none') {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
            expansion.style.display = 'grid';
            actionButton.innerText = 'expand_less';
          } else {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
          }
        },
        exportCurrentForce() {
          if (this.myForce !== undefined && this.myForce.name !== undefined) {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.myForce));
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "scene.json");
            dlAnchorElem.click();
          }
        },
        saveAndClear() {
          this.recalcTotals();
          saveCollection('forces', this.myForces);
        },
        changeNameDirection() {
          if (this.sortColumn != 0) {
            this.sortColumn = 0;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.filteredDice = this.applyFiltersAndSort();
        },
        changeSizeDirection() {
          if (this.sortColumn != 1) {
            this.sortColumn = 1;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.filteredDice = this.applyFiltersAndSort();
        },
        changeTypeDirection() {
          if (this.sortColumn != 2) {
            this.sortColumn = 2;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.filteredDice = this.applyFiltersAndSort();
        },
        applyFiltersAndSort() {
          let that = this;

          let dice = this.myForces[this.forceSlot];

          dice.forEach(die => {
            let namesArr = that.diceGroupedByEdition[die.name];
            if (namesArr === undefined) {
              namesArr = [];
              that.diceGroupedByEdition[die.name] = namesArr;
            }

            namesArr.push(die);
          });

          return dice;
        },
        getImageID(die) {
          const filteredDie = this.sourceDice.filter(sourceDie => sourceDie.name === die.name && sourceDie.editions.includes(die.edition)) [0] || {};
          return filteredDie.id; 
        },
        saveTheForces() {
          saveCollection('forces', this.myForces);
        },
        browseDice() {
          this.setForceSlot(this.forceSlot);
          if (this.myForce.name !== undefined && this.myForce.name !== '') {
            this.$router.push(`/forcesdicebrowser/?name=${this.myForce.name}`);
          }
        },
        changeAmount(grDie) {
          if (!isNaN(grDie.amount)) {
            this.myForces[this.forceSlot].map(die => {
              let newDie = {...die};

              if (die.name === grDie.name && die.edition === grDie.edition) {
                newDie.amount = grDie.amount;
              }

              return newDie;
            });
          }
        },
        recalcSubTotals(die) {
          if (this.diceGroupedByEdition[die.name] === undefined) {
            return 0;
          }
          return this.diceGroupedByEdition[die.name].reduce( (previousValue, currentValue) => previousValue += currentValue.amount, 0);
        },
        calcSlotTotal(slot) {
          return slot.reduce( (prev, current) => prev + current.amount, 0);
        },
        recalcTotals() {
          let that = this;
          const forceTotal = Object.keys(this.myForce.slots).reduce( (total, slotName) => total + that.calcSlotTotal(that.myForce.slots[slotName]), 0);
          const slotTotal = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(this.myForce.slots[this.forceSlot]) : 0;
          this.totalDice = `${slotTotal} / ${forceTotal}`;
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.forcesTour = false;
          saveCollection('profiles', profile);
        },
        setMyForce() {
          let that = this;
          this.myForce = this.myForces.filter(force => force.name == that.forceName)[0] || {slots: {}};
          this.recalcTotals();
        },
        setForcesSlot() {
          this.recalcTotals();
        },
    },
};
</script>

<style scoped>
  input {
    width: 5em;
  }

  input#forceName {
    width: 15em;
  }


  button {
    width: 10em;
  }

  button#export {
    width: 32px;
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