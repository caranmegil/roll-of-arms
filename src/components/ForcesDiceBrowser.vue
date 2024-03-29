<template>
    <v-tour name="diceBrowserTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="dice-browser">
          <Loading v-model:active="isLoading"/>
      <div id="dice">
          <div class="header">
              <h1>Dice Browser - {{this.$store.state.forceSlot}}</h1>
              <div v-if="hasError" class="error">{{message}}</div>
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
                <a @click="returnToModifier">Return to {{this.$store.state.forceName}}</a>
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
                  <div class="add-die">
                    <span @click="() => decr()" class="material-icons material-icons-outlined">remove</span>
                    <input type="number" v-model="dieAmnt" @change="capAmount"/>
                    <span @click="() => incr()" class="material-icons material-icons-outlined">add</span>
                    <button @click="() => addDie(die)">Add</button>
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import {
  mapActions,
  mapGetters,
} from 'vuex';
import {
  resetSlots,
  mergeMyForces,
} from '@/utils';
import 'es6-promise/auto';
import {
  getCollection,
  getEntireCollection,
  saveCollection,
} from '@/firebase';

export default {
    name: 'ForcesDiceBrowser',
    components: {
      Loading,
    },
    data() {
        return {
            dice: [],
            tourCallbacks: {
              onSkip: this.noMoreTours,
              onFinish: this.noMoreTours,
            },
            sortColumn: 0,
            sortDirection: 1,
            myForces: [],
            myForce: {},
            openedId: null,
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
            nameFilter: '',
            dieAmnt: 0,
            hasError: false,
            message: '',
            isLoading: true,
            observer: null,
        };
    },
    async mounted() {
      this.dice = await getEntireCollection('dice');
      this.myForces = this.getMyForces() || [];
      this.myForce = this.myForces.filter( force => force.name === this.$store.state.forceName)[0];

      let options = {
        root: document.querySelector('.body'),
        rootMargin: '0px',
        threshold: 1.0
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach( entry => {
          entry.target.parentNode.scrollIntoView({behavior: 'smooth', block: 'start'});
        })
      }, options);

      resetSlots(this.myForce);

      const profile = await getCollection('profiles') || {};
      if (profile.diceBrowserTour || profile.diceBrowserTour === undefined) {
        this.$tours['diceBrowserTour'].start();
      }

      this.sizeFilter = this.$store.state.filters.size;
      this.typeFilter = this.$store.state.filters.type;
      let species = [];

      if (this.$store.state.forceSlot === 'Summoning') {
          this.dice = this.dice.filter ( die => ['Dragons', 'Dragonkin'].includes(die.species) || die.rarity === 'Minor Terrain');
      } else if (this.$store.state.forceSlot === 'Home Terrain') {
          this.dice = this.dice.filter ( die => die.rarity === 'Basic Terrain');
      } else if (this.$store.state.forceSlot === 'Frontier Terrain') {
          this.dice = this.dice.filter ( die => ['Advanced Terrain', 'Basic Terrain'].includes(die.rarity));
      } else {
          this.dice = this.dice.filter ( die => !(['Dragons', 'Dragonkin', 'Terrain'].includes(die.species)));
      }

      this.dice.forEach(die => species.push(die.species));
      species = [...new Set(species)];
      species.sort();

      this.species = species;
      this.setSpeciesFilter();      
    },
    methods: {
        ...mapActions(['setFilters', 'setMyForces']),
        ...mapGetters(['getMyForces']),
        capAmount() {
          if (this.$store.state.forceSlot.includes('Terrain')) {
            if (this.dieAmnt > 1) {
              this.dieAmnt = 1;
            }
          }
          if (this.dieAmnt < 0) {
            this.dieAmnt = 0;
          }
        },
        decr() {
          if (this.dieAmnt > 0) {
            this.dieAmnt--;
          }

          this.capAmount();
        },
        incr() {
          this.dieAmnt++;
          this.capAmount();
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
          this.dieAmnt = 0;

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
        async addDie(die) {
          let added = false;
          let newDie = {...die};
          delete newDie.editions;
          delete newDie.id;
          delete newDie.sfrID;
          newDie.amount = this.dieAmnt;
          this.expand(die);
          this.hasError = false;
          this.message = '';
          if (newDie.rarity.includes('Terrain')) {
            if (this.myForce.slots[this.$store.state.forceSlot].length > 0) {
              this.hasError = true;
              this.message = 'We\'re sorry, but only one terrain die may be added here.';
              return;
            } else {
              this.myForce.slots[this.$store.state.forceSlot] = [newDie];
              added = true;
            }
          } else {
            this.myForce.slots[this.$store.state.forceSlot].forEach( die => {
              if (added) return;

              if (die.name === newDie.name) {
                die.amount += newDie.amount;
                added = true;
              }
            });
          }

          if(!added) {
            this.myForce.slots[this.$store.state.forceSlot].push(newDie);
          }

          saveCollection('forces', mergeMyForces(this.myForces, this.getMyForces()));
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
          this.setFilters({species: '', edition: '', size: '', type: ''});
          this.$router.push('/my-forces')
        }
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
  .single-element {
    align-self: center;
    justify-self: center;
    margin: 0em;
    width: 25%;
  }
  #dice .header .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding: .25em;
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

  .row {
    width: 100%;
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
  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }
</style>