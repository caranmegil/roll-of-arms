<template>
    <div class="collections" v-if="publicForces.length > 0">
        <h2>Their Forces</h2>
        <div class="filters">
            <div class="element-horizontal">
                <select id="forcesFilter" v-model="forceName" size="5" @change="() => loadForce(forceName)">
                    <option v-for="name in (publicForces || []).map( force => force.name )" :key="name" :value="name">{{name}}</option>
                </select>
            </div>
            <div class="element">
                <label for="forceFilter">Dice Group</label>
                <select id="forceFilter" v-model="forceSlot" @change="setForcesSlot">
                    <option value="Home" selected="selected">Home Army</option>
                    <option value="Home Terrain">Home Terrain</option>
                    <option value="Horde">Horde Army</option>
                    <option value="Campaign">Campaign Army</option>
                    <option value="Frontier Terrain">Frontier Terrain</option>
                    <option value="Summoning">Summoning Pool</option>
                </select>
            </div>
            <div class="element"><label for="totalPoints">Total Points</label><div id="totalPoints">{{totalPoints}}</div></div>
        </div>
        <div class="header">
            <div class="column-header die-id" @click="changeNameDirection">Name <span v-if="sortColumn != 0" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
            <div class="column-header size" @click="changeSizeDirection">Size  <span v-if="sortColumn != 1" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
            <div class="column-header type" @click="changeTypeDirection">Type  <span v-if="sortColumn != 2" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
            <div></div>
        </div>

        <div class="dice">
            <div class="body" v-if="myForce != null">
                <div v-for="die in myForce.slots[forceSlot]" :key="`force-${die.name}`" :id="die.name" class="row">
                    <div @click="() => expand(die)" class="die-id"><img :src="getImageID(die)"/><div>{{die.name}} ({{die.amount}})</div></div>
                    <div @click="() => expand(die)" class="size">{{die.rarity}}</div>
                    <div @click="() => expand(die)" class="type">{{die.type}}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
  getCollection,
} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ProfileForces',
  props: ['sourceDice',],
  data() {
    return {
        totalPoints: '0 / 0',
        sortColumn: 0,
        sortDirection: 1,
        filteredDice: [],
        publicForces: [],
        myForce: null,
        forceSlot: 'Home',
    };
  },
  methods: {
    getImageID(die) {
        const dice = this.sourceDice.filter(sourceDie => sourceDie.name === die.name);
        return dice[0].id; 
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
      let dice = this.dice.filter( die => that.speciesFilter === '' || die.species === that.speciesFilter );

      let sizes = [];
      let types = [];
      dice.forEach( die => {
        sizes.push(die.rarity);
        types.push(die.type);
      });

      sizes = [...new Set(sizes)];
      sizes.sort();
      types = [...new Set(types)];
      types.sort();

      this.sizes = sizes;
      this.types = types;

      dice = dice.filter( die =>
                          (that.typeFilter === '' || die.type === that.typeFilter)
                          && (that.sizeFilter === '' || die.rarity === that.sizeFilter)
                        );
      dice.sort( (a, b) => {
        if (that.sortColumn == 0) {
          return that.sortDirection * a.name.localeCompare(b.name);
        } else if (that.sortColumn == 1) {
          return that.sortDirection * a.rarity.localeCompare(b.rarity);
        } else if (that.sortColumn == 2) {
          return that.sortDirection * a.type.localeCompare(b.type);
        } else if (that.sortColumn == 3) {
          return that.sortDirection * a.edition.localeCompare(b.edition);
        }

      });

      this.diceGroupedByEdition = {};
      dice.forEach(die => {
        let namesArr = that.diceGroupedByEdition[die.name];
        if (namesArr === undefined) {
          namesArr = [];
          that.diceGroupedByEdition[die.name] = namesArr;
        }

        namesArr.push(die);
      });

      dice = Object.keys(this.diceGroupedByEdition).map(name => this.diceGroupedByEdition[name][0]);

      return dice;
    },
    recalcSubTotals(die) {
      if (this.diceGroupedByEdition[die.name] === undefined) {
        return 0;
      }
      return this.diceGroupedByEdition[die.name].reduce( (previousValue, currentValue) => previousValue += currentValue.amount, 0);
    },
    expand(id) {
      let row = document.getElementById(id);
      let actionButton = row.querySelector('#action-button');
      let expansion = row.querySelector('#expansion');
      if (window.getComputedStyle(expansion).display === 'none') {
        let expansions = document.querySelectorAll('#expansion');
        [...expansions].forEach((dieExpansion) => dieExpansion.style.display = 'none');
        expansion.style.display = 'grid';
        actionButton.innerText = 'expand_less';
      } else {
        expansion.style.display = 'none';
        actionButton.innerText = 'expand_more';
      }
    },
    weightDie(die, isSummoning) {
        let pointValue = 0;

        if (isSummoning) {
        if (die.species === 'Dragonkin') {
            switch (die.rarity) {
            case 'Small':
                pointValue = 1;
                break;
            case 'Medium':
                pointValue = 2;
                break;
            case 'Large':
                pointValue = 3;
                break;
            default:
                pointValue = 4;
                break;
            }
        } else {
            pointValue = 1;
        }
        } else {
        if (die.species === 'Items') {
            switch (die.type) {
            case 'Relic':
                pointValue = 4;
                break;
            case 'Medallion':
                pointValue = 3;
                break;
            default:
                if (die.rarity === 'Large Equipment') {
                pointValue = 2;
                } else if (die.rarity == 'Small Equipment') {
                pointValue = 1;
                }
                break;
            }
        } else if (die.species === 'Dragons' || die.species === 'Dragonkin' || die.species === 'Terrain') {
            pointValue = 0;
        } else {
            switch (die.rarity) {
            case 'Small':
                pointValue = 1;
                break;
            case 'Medium':
                pointValue = 2;
                break;
            case 'Large':
                pointValue = 3;
                break;
            default:
                pointValue = 4;
                break;
            }
        }
        }

        return pointValue;
    },
    flattenForce() {
        let dice = []
        Object.keys(this.myForce.slots).forEach( slotName => slotName !== 'Summoning' ? dice = [...dice, ...this.myForce.slots[slotName]] : dice);
        return dice;
    },
    calcMediumEquipment() {
        let dice = this.flattenForce();
        const totalMediumEquipment = dice.filter(die => die.species === 'Items' && die.rarity === 'Medium Equipment').reduce( (total, die) => total + die.amount, 0);

        return Math.floor(totalMediumEquipment / 2) * 3 + ( (totalMediumEquipment % 2) * 2);
    },
    calcSlotTotal(slot, isSummoning) {
        let that = this;
        let totals = slot.reduce( (prev, current) => prev + that.weightDie(current, isSummoning) * current.amount, 0);
        return totals;
    },
    recalcTotals() {
        let that = this;
        if (this.forceSlot === 'Summoning') {
        const totalDKPoints = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(this.myForce.slots[this.forceSlot].filter(die => die.species === 'Dragonkin'), true) : 0;
        const totalDragons = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(this.myForce.slots[this.forceSlot].filter(die => die.species === 'Dragons'), true) : 0;
        const totalMTs = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(this.myForce.slots[this.forceSlot].filter(die => die.rarity === 'Minor Terrain'), true) : 0;
        this.totalPoints = `Dragons ${totalDragons} / Kin: ${totalDKPoints} / Minors: ${totalMTs}`;
        console.log('summoning', this.totalPoints)
        } else {
        const forceTotal = Object.keys(this.myForce.slots).reduce( (total, slotName) => total + that.calcSlotTotal(that.myForce.slots[slotName]), 0) + this.calcMediumEquipment();
        const slotTotal = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(this.myForce.slots[this.forceSlot], false) : 0;
        this.totalPoints = `${slotTotal} / ${forceTotal}`;
        }

    },
    setForcesSlot() {
        this.recalcTotals();
    },
  },
  async mounted() {
    this.publicForces = (await getCollection('forces') || []).filter(force => force.isPublic);
    this.myForce = this.publicForces[0];
  },
}
</script>

<style scoped>
  .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding-bottom: .5em;
  }

  .element-horizontal {
    padding-bottom: .5em;
  }

    select {
    border-radius: .25em;
    width: 15em;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }

  .profiles {
    margin: .5em;
  }

  .collections {
    width: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: 1fr auto;
    align-items: center;
    justify-items: center;
    gap: .5em;
  }

  .collections .header {
    width: 100%;
    position: sticky;
    margin-bottom: .75em;
    border-bottom: 1px solid black;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr;
    font-weight: bold;
    align-items: center;
    justify-items: center;
  }

  .collections .header h1 {
    text-align: center;
    align-self: center;
    justify-self: center;    
  }
  .filters {
    margin-bottom: .75em;
    font-weight: bold;
    display: grid;
    align-items: center;
    justify-items: center;
  }

  .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
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
    grid-template-columns: 1fr 1fr 1fr;
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
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-items: center;
    align-items: center;
    gap: .25em;
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

  .column-header {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr auto;
    align-items: center;
  }
  .add-die {
    grid-auto-flow: column;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    gap: .5em;
  }
  .add-die:nth-child(even) {
    background-color: #CCC;
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
    .body {
      height: 40vh;
    }
 
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
