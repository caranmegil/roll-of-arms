<template>
    <v-tour name="diceBrowserTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="dice-browser">
      <div id="dice">
          <Loading v-model:active="isLoading"/>
          <div v-if="hasDiceBeenAdded" class="alert-box saved">Added to your collection:{{addedDiceMessage}} <button @click="dismissDiceBeenAdded">Dismiss</button></div>
          <div class="header">
              <div @click="rerunTour" class="rerun-tour material-icons material-icons-outlined">help</div>
              <h1>Dice Browser</h1>
              <span id="filters">
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
              </span>

              <button class="single-element" @click="clearAllFilters">Clear</button>

              <div class="anchor-element">
                <a @click="returnToModifier">Return to My Collection</a>
              </div>

              <div class="table-header">
                  <div class="column-header die-id" @click="changeNameDirection">Name <span v-if="sortColumn != 0" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                  <div class="column-header size" @click="changeSizeDirection">Size  <span v-if="sortColumn != 1" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                  <div class="column-header type" @click="changeTypeDirection">Type  <span v-if="sortColumn != 2" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
              </div>
          </div>
          <div class="body">
              <div v-for="die in filteredDice" :key="die.sfrID" class="row"  :id="die.sfrID">
                <div class="die-id"><img @click="() => expand(die)" :src="die.id"/><div>{{die.name}}</div></div>
                <div @click="() => expand(die)" class="size">{{die.rarity}}</div>
                <div @click="() => expand(die)" class="type">{{die.type}}</div>
                <div @click="() => expand(die)" class="add-button"><span id="action-button" class="material-icons material-icons-outlined">expand_more</span></div>
                <div id="expansion">
                  <button @click="() => addDie(die)">Add {{die.name}}</button>
                  <div v-for="edAmnt in amount" :key="die.name + '/' + edAmnt.edition" class="add-die">
                    <span>{{ (edAmnt.edition === '-') ? 'Standard' : edAmnt.edition}}</span>
                    <span @click="() => decr(edAmnt)" class="material-icons material-icons-outlined">remove</span>
                    <input type="number" v-model="edAmnt.value"/>
                    <span @click="() => incr(edAmnt)" class="material-icons material-icons-outlined">add</span>
                  </div>
                  <button @click="() => addDie(die)">Add {{die.name}}</button>
                </div>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';import { mapActions } from 'vuex';
import 'es6-promise/auto';
import {
  getCollection,
  getEntireCollection,
  saveCollection,
} from '@/firebase';

export default {
    name: 'DiceBrowser',
    components: {
      Loading,
    },
    data() {
      return {
        hasDiceBeenAdded: false,
        addedDiceMessage: '',
        observer: null,
        dice: [],
        tourCallbacks: {
          onSkip: this.noMoreTours,
          onFinish: this.noMoreTours,
        },
        sortColumn: 0,
        sortDirection: 1,
        myCollection: [],
        amount: {},
        openedId: null,
        nameFilter: '',
        sizes: [],
        sizeFilter: '',
        types: [],
        typeFilter: '',
        steps: [
          {
            target: '#filters',
            header: {
              title: 'Filters!',
            },
            content: 'Set your species/set and edition filters here.',
          },
          {
            target: '.body',
            header: {
              title: 'The Dice!',
            },
            content: 'Scroll through this list and locate the die you want to add to your collection and select the "+" to add.',
            params: {
              placement: 'auto',
            },
          },
        ],
        filteredDice: [],
        speciesFilter: '',
        species: [],
        isLoading: true,
      };
    },
    async mounted() {
      let options = {
        root: document.querySelector('.body'),
        rootMargin: '0px',
        threshold: 1.0
      }

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach( entry => {
          entry.target.parentNode.scrollIntoView({behavior: 'smooth', block: 'start'});
        })
      }, options);
      this.dice = await getEntireCollection('dice');
      this.myCollection = await getCollection('collections') || [];

      const profile = await getCollection('profiles') || {};
      if (profile.diceBrowserTour || profile.diceBrowserTour === undefined) {
        this.$tours['diceBrowserTour'].start();
      }

      this.speciesFilter = this.$store.state.filters.species;
      this.sizeFilter = this.$store.state.filters.size;
      this.typeFilter = this.$store.state.filters.type;
      let species = [];

      this.dice.forEach(die => species.push(die.species));
      species = [...new Set(species)];
      species.sort();

      this.species = species;
      this.setSpeciesFilter();     
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
        dismissDiceBeenAdded() {
          this.hasDiceBeenAdded = false;
        },
        capAmount(edAmnt) {
          if (edAmnt.value < 0) {
            edAmnt.value = 0;
          }
        },
        rerunTour() {
          this.$tours['diceBrowserTour'].start();
        },
        decr(edAmnt) {
          if (edAmnt.value > 0) {
            edAmnt.value--;
          }
          this.capAmount(edAmnt);
        },
        incr(edAmnt) {
          edAmnt.value++;
          this.capAmount(edAmnt);
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

          dice.sort( (a, b) => {
            if (that.sortColumn == 0) {
              return that.sortDirection * a.name.localeCompare(b.name);
            } else if (that.sortColumn == 1) {
              return that.sortDirection * a.rarity.localeCompare(b.rarity);
            } else if (that.sortColumn == 2) {
              return that.sortDirection * a.type.localeCompare(b.type);
            }
          });

          return dice;
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
          this.isLoading=true;
          this.filteredDice = this.applyFiltersAndSort();
          this.isLoading=false;
        },
        changeTypeDirection() {
          if (this.sortColumn != 2) {
            this.sortColumn = 2;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.isLoading=true;
          this.filteredDice = this.applyFiltersAndSort();
          this.isLoading=false;
        },
        changeEditionDirection() {
          if (this.sortColumn != 3) {
            this.sortColumn = 3;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.isLoading=true;
          this.filteredDice = this.applyFiltersAndSort();
          this.isLoading=false;
        },
        expand(die) {
          let row = document.getElementById(die.sfrID);
          let actionButton = row.querySelector('#action-button');
          let expansion = row.querySelector('#expansion');
          let allExpansions = document.querySelectorAll('#expansion');

          if (window.getComputedStyle(expansion).display === 'none') {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
            this.observer.observe(expansion);
            expansion.style.display = 'grid';
            actionButton.innerText = 'expand_less';
            this.amount = die.editions.map(edition => { return {edition, value: 0} });
          } else {
            allExpansions.forEach(expansion => {
              let actionButton = expansion.parentNode.querySelector('#action-button');
              expansion.style.display = 'none';
              actionButton.innerText = 'expand_more';
            });
            this.amount = {};
          }
          row.classList.toggle('highlight');
        },
        async addDie(die) {
          let that = this;
          let addedDiceMessage = '';
          this.amount.forEach( async edAmnt => {
            let newDie = {...die};
            delete newDie.editions;
            delete newDie.id;
            delete newDie.sfrID;
            this.capAmount(edAmnt);
            if (edAmnt.value > 0) {
              if (addedDiceMessage.length > 0) {
                addedDiceMessage = `${addedDiceMessage}, `
              }
              addedDiceMessage = `${addedDiceMessage}${edAmnt.value} ${die.name} (${edAmnt.edition})`
            }
            if (edAmnt.value >= 0) {
              newDie.edition = edAmnt.edition;
              newDie.amount = edAmnt.value;
              let dieForEdition = that.myCollection.filter(die => die.name === newDie.name && die.edition === newDie.edition);
              if (dieForEdition.length == 0) {
                that.myCollection.push(newDie);
              } else {
                let die = dieForEdition[0];
                die.amount += edAmnt.value;
              }
            }
          });
          this.hasDiceBeenAdded = true;
          this.addedDiceMessage = addedDiceMessage;
          await saveCollection('collections', that.myCollection);
          that.expand(die);
          this.amount = {};
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.diceBrowserTour = false;
          saveCollection('profiles', profile);
        },
        setNameFilter() {
            this.isLoading=true;
            this.filteredDice = this.applyFiltersAndSort();
            this.isLoading=false;
        },
        setSpeciesFilter() {
            this.isLoading=true;
            this.editionFilter = '';
            this.sizeFilter = '';
            this.typeFilter = '';
            this.filteredDice = this.applyFiltersAndSort();
            this.isLoading=false;
        },
        setSizeFilter() {
            this.isLoading=true;
            this.filteredDice = this.applyFiltersAndSort();
            this.isLoading=false;
        },
        setTypeFilter() {
            this.isLoading=true;
            this.filteredDice = this.applyFiltersAndSort();
            this.isLoading=false;
        },
        clearAllFilters() {
          this.speciesFilter = '';
          this.sizeFilter = '';
          this.typeFilter = '';
          this.nameFilter = '';
          this.isLoading=true;
          this.filteredDice = this.applyFiltersAndSort();
          this.isLoading=false;
        },
        returnToModifier() {
          this.$router.push('/my-collection');
        },
    },
};
</script>

<style scoped>
  .dice-browser {
    padding: .5em;
  }

  #dice .header h1 {
    align-self: center;
    justify-self: center;    
  }
  #dice .header .anchor-element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
  }
  #dice .header .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding: .25em;
  }
  #dice .header .single-element {
    align-self: center;
    justify-self: center;
    margin: 0em;
    width: 25%;
  }
  #dice .header .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: center;
    padding-right: .5em;
  }
  #dice .header select {
    border-radius: .25em;
    width: 15em;
  }

  #dice {
    display: grid;
    align-items: center;
    justify-items: center;
  }

  #dice .header {
    width: 100%;
    position: sticky;
    display: grid;
    grid-auto-flow: row;
    grid-template-rows: 1fr 1fr 1fr;
    font-weight: bold;
  }

  #dice .header .table-header {
    width: 100%;
    margin-bottom: .75em;
    border-bottom: 1px solid black;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-weight: bold;
    align-content: center;
    justify-content: center;
    align-items: center;
    justify-items: center;
  }

  #dice > .body {
    width: 100%;
    overflow: auto;
    height: 50vh;
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

  .highlight {
    background-color: #fff;
    border: 1pt solid black;
  }

  .row {
    width: 99%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr auto;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    gap: .25em;
  }

  input {
    width: 5em;
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

  .add-button {
    grid-column: 4;
    grid-row: 1;
    font-size: 24px;
    width: 25%;
  }

  .die-id {
    grid-column: 1;
    grid-row: 1;
    display: grid;
    text-align: center;
    justify-items: center;
    width: 25%;
  }

  .column-header {
    display: grid;
    grid-auto-flow: column;
    text-align: center;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
  }

  .sort-icon {
    font-size: 24px;
  }
  @media screen and (max-width: 480px) {
    #dice > .body {
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
