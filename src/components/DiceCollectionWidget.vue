<template>
    <div class="collections">
    <Loading v-model:active="isLoading"/>
      <div class="header">
        <span id="filters">
          <div class="element">
            <label for="privacy">Show Only Wanted</label>
            <input type="checkbox" v-model="showOnlyWanted" @change="changeWantedDisplay"/>
          </div>
          <div class="element">
              <label for="speciesFilter">Species/Set</label>
              <select id="speciesFilter" v-model="speciesFilter" @change="setSpeciesFilter">
                  <option value="">All</option>
                  <option v-for="option in species" :key="option" :value="option">{{option}}</option>
              </select>
          </div>
          <div class="element">
              <label for="sizeFilter">Size</label>
              <select id="sizeFilter" v-model="sizeFilter" @change="setSizeFilter">
                  <option value="" selected="true">All</option>
                  <option v-for="option in sizes" :key="option" :value="option">{{option}}</option>
              </select>
          </div>
          <div class="element">
              <label for="typeFilter">Type</label>
              <select id="typeFilter" v-model="typeFilter" @change="setTypeFilter">
                  <option value="" selected="true">All</option>
                  <option v-for="option in types" :key="option" :value="option">{{option}}</option>
              </select>
          </div>
          <div class="element">
              <label for="nameFilter">Name</label>
              <input id="nameFilter" type="text" v-model="nameFilter" @keyup="setNameFilter"/>
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
        <div id="dice-body" class="body">
          <div v-for="(die) in filteredDice" :key="die.sfrID" :id="die.name" class="row">
              <div class="die-id"><img :src="getImageID(die)"/><div>{{die.name}} ({{recalcSubTotals(die)}})</div></div>
              <div class="size">{{die.rarity}}</div>
              <div class="type">{{die.type}}</div>
                <div @click="() => expand(die)" class="add-button"><span id="action-button" class="material-icons material-icons-outlined">expand_more</span></div>
                <div id="expansion">
                  <div v-for="grDie in diceGroupedByEdition[die.name]" :key="die.name + '/' + grDie.edition" class="add-die">
                    <span>{{ grDie.edition }}</span>
                    <div class="amount">Have: {{grDie.amount}}</div>
                    <div class="wanted" :style="{visibility: (grDie.wanted > 0) ? 'visible' : 'hidden'}">Want: {{grDie.wanted}}</div>
                  </div>
                </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {
  getCollectionByField,
} from '@/firebase';
import {
  convertEditionForDie,
} from '@/utils';

export default {
    name: 'DiceCollectionWidget',
    props: ['sourceDice', 'profile', 'uid'],
    components: {
      Loading,
    },
    data() {
      return {
            showOnlyWanted: false,
            totalDice: 0,
            sortColumn: 0,
            sortDirection: 1,
            dice: [],
            diceGroupedByEdition: {},
            filteredDice: [],
            speciesFilter: '',
            species: [],
            sizes: [],
            sizeFilter: '',
            types: [],
            typeFilter: '',
            nameFilter: '',
            observer: null,
            isLoading: true,
        };
    },
    async mounted() {
      let options = {
        root: document.getElementById('dice-body'),
        rootMargin: '0px',
        threshold: 1.0
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach( entry => {
          entry.target.parentNode.scrollIntoView({behavior: 'smooth', block: 'start'});
        })
      }, options);

      if (this.profile.collectionTour || this.profile.collectionTour === undefined) {
        this.$tours['collectionTour'].start();
      }

      this.isLoading = true;
      this.dice = await getCollectionByField('collections', this.uid) || [];
      this.dice.forEach( die => die.edition = convertEditionForDie(die));

      this.speciesFilter = '';
      this.sizeFilter = this.$store.state.filters.size;
      this.typeFilter = this.$store.state.filters.type;
      
      let species = [];
      this.dice.forEach(die => species.push(die.species));

      species = [...new Set(species)].sort();
      this.species = species;
      this.isLoading = false;
      this.setSpeciesFilter();
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
        changeWantedDisplay() {
          this.isLoading = true;
          this.filteredDice = this.applyFiltersAndSort();
          this.recalcTotals();
          this.isLoading = false;
        },
        expand(die) {
          let row = document.getElementById(die.name);
          let actionButton = row.querySelector('#action-button');
          let expansion = row.querySelector('#expansion');
          let allExpansions = document.querySelectorAll('#expansion');

          if (window.getComputedStyle(expansion).display === 'none') {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
            expansion.style.display = 'grid';
            actionButton.innerText = 'expand_less';
            this.observer.observe(expansion);
          } else {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
          }
        },
        rerunTour() {
          this.$tours['collectionTour'].start();
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

          let dice = this.dice.filter(die => (that.speciesFilter === '' || die.species === that.speciesFilter) && die.name.toLowerCase().includes(that.nameFilter.toLowerCase()));

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

          this.setFilters({species: this.speciesFilter, edition: this.editionFilter, size: this.sizeFilter, type: this.typeFilter});

          dice = dice.filter( die =>
                              (that.typeFilter === '' || die.type === that.typeFilter)
                              && (that.sizeFilter === '' || die.rarity === that.sizeFilter)
                            );

          if (this.showOnlyWanted) {
            dice = dice.filter(die => die.wanted && die.wanted > 0);
          }

          dice.sort((a, b) => {
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
        getImageID(die) {
          const dice = this.sourceDice.filter(sourceDie => sourceDie.name === die.name && sourceDie.editions.includes(die.edition));
          return dice[0].id; 
        },
        recalcSubTotals(die) {
          if (this.diceGroupedByEdition[die.name] === undefined) {
            return 0;
          }
          return this.diceGroupedByEdition[die.name].reduce( (previousValue, currentValue) => previousValue += currentValue.amount, 0);
        },
        recalcTotals() {
          const filteredDiceNames = this.filteredDice.map(die => die.name);
          let totalDice = this.dice.filter(die => filteredDiceNames.includes(die.name)).map(die => die.amount).reduce( (total, amount) => total + amount, 0);
          this.totalDice = totalDice;
        },
        setCurrentDie(die) {
          this.setCollectionDie(die);
        },
        setNameFilter() {
            this.isLoading=true;
            this.filteredDice = this.applyFiltersAndSort();
            this.isLoading=false;
        },
        setSpeciesFilter() {
            this.sizeFilter = '';
            this.typeFilter = '';
            this.filteredDice = this.applyFiltersAndSort();
            this.recalcTotals();
        },
        setSizeFilter() {
            this.filteredDice = this.applyFiltersAndSort();
            this.recalcTotals();
        },
        setTypeFilter() {
            this.filteredDice = this.applyFiltersAndSort();
            this.recalcTotals();
        },
    },
};
</script>

<style scoped>
  input {
    width: 5em;
  }

  button {
    width: 10em;
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

  .wanted {
    color: #AA4A44;
  }

  .add-die {
    grid-auto-flow: column;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    justify-content: center;
    align-content: center;
    justify-items: start;
    align-items: center;
    gap: .5em;
    padding-left: 1.0em;
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