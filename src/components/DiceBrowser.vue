<template>
    <v-tour name="diceBrowserTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="dice-browser">
      <div id="dice">
          <div class="header">
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
                    <label for="editionFilter">Edition</label>
                    <select id="editionFilter" v-model="editionFilter" @change="setEditionFilter">
                        <option value="">All</option>
                        <option v-for="option in editions" :key="option" :value="option">{{option}}</option>
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
              </span>

              <div class="table-header">
                  <div class="column-header" @click="changeNameDirection">ID <span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                  <div class="column-header" @click="changeEditionDirection">Edition <span v-if="sortColumn == 3 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 3 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                  <div class="column-header" @click="changeSizeDirection">Size  <span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                  <div class="column-header" @click="changeTypeDirection">Type  <span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
              </div>
          </div>
          <div class="body">
              <div v-for="die in filteredDice" :key="die.name + '/' + die.edition" class="row"  :id="die.name + '/' + die.edition">
                <div  @click="() => expand(die.name + '/' + die.edition)" class="die-id"><img :src="die.id"/><div>{{die.name}}</div></div>
                <div @click="() => expand(die.name + '/' + die.edition)" class="edition">{{die.edition}}</div>
                <div @click="() => expand(die.name + '/' + die.edition)" class="size">{{die.rarity}}</div>
                <div @click="() => expand(die.name + '/' + die.edition)" class="type">{{die.type}}</div>
                <div @click="() => expand(die.name + '/' + die.edition)" class="add-button"><span id="action-button" class="material-icons material-icons-outlined">expand_more</span></div>
                <div id="expansion" class="add-die">
                  <span @click="decr" class="material-icons material-icons-outlined">remove</span>
                  <input type="number" v-model="amount"/>
                  <span @click="incr" class="material-icons material-icons-outlined">add</span>
                  <button @click="() => setCurrentDie(die)">Add</button>
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
  getEntireCollection,
  saveCollection,
} from '@/firebase';

export default {
    name: 'DiceBrowser',
    data() {
        return {
            dice: [],
            tourCallbacks: {
              onSkip: this.noMoreTours,
              onFinish: this.noMoreTours,
            },
            sortColumn: 0,
            sortDirection: 1,
            myCollection: [],
            amount: 0,
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
            editionFilter: '',
            species: [],
            editions: [],
        };
    },
    async mounted() {
      this.dice = await getEntireCollection('dice');
      this.myCollection = await getCollection('collections') || [];
      this.myCollection = this.myCollection.map(die => {
          let newDie = {...die};
          delete newDie['faces'];
          if (die.species === 'Eldarim') {
              newDie.species = 'Eldarim, White';
          }
          if (die.species === 'Item' && die.name.startsWith('Gold')) {
              newDie.name = die.name.replace('Gold', 'Yellow');
          }
          if (die.species === 'Eldarim, Gold') {
              newDie.name = die.name.replace('Gold', 'Yellow');
              newDie.species = 'Eldarim, Yellow';
          }
          if (die.species === 'Dragon') {
              if (!newDie.name.includes('/')) {
                  newDie.type = 'Elemental';
                  newDie.rarity = 'Elemental';
              } else if (newDie.name.includes('White')) {
                  newDie.type = 'White';
                  newDie.rarity = 'White';
              } else if (newDie.name.includes('Ivory')) {
                  newDie.type = 'Ivory Hybrid';
                  newDie.rarity = 'Ivory Hybrid';
              } else {
                  newDie.type = 'Hybrid';
                  newDie.rarity = 'Hybrid';
              }
              newDie.name = die.name.replace('Gold', 'Yellow');
          }
          if (die.species === 'Dragonkin') {
              newDie.name = die.name.replace('Gold', 'Yellow');
          }
          if (die.species === 'Item') {
              if (die.rarity !== 'Artifact') {
                  newDie.rarity = `${die.rarity} Equipment`
              }
              newDie.species = 'Item';
          }
          if (die.species === 'Medallion') {
              newDie.species = 'Item';
          }
          if (die.species === 'Relic') {
              newDie.species = 'Item';
          }
          if (die.species.endsWith('Terrain')) {
              newDie.species = 'Terrain';
              const nameSplit = die.name.split(' ');
              if (nameSplit.length == 2) {
                newDie.type = `${nameSplit[1]} ${nameSplit[0]}`;
              } else {
                newDie.type = `${nameSplit[1]} ${nameSplit[2]} ${nameSplit[0]}`;
              }
          }
          if (newDie.species === 'Terrain') {
              if (newDie.name.match(/^.+ (Castle|(?:Dragon Lair)|Grove|Vortex)$/)) {
                  newDie.rarity = 'Advanced Terrain';
              } else if (newDie.name.match(/^.+ (Tower|City|(?:Standing Stones)|Temple)$/)) {
                  newDie.rarity = 'Basic Terrain';
              }
          }
          return newDie;
      });

      const profile = await getCollection('profiles') || {};
      if (profile.diceBrowserTour || profile.diceBrowserTour === undefined) {
        this.$tours['diceBrowserTour'].start();
      }

      this.speciesFilter = this.$store.state.filters.species;
      this.editionFilter = this.$store.state.filters.edition;
      this.sizeFilter = this.$store.state.filters.size;
      this.typeFilter = this.$store.state.filters.type;
      let species = [];
      for (let k in this.dice) {
        species.push(k);
      }

      this.species = species;
      this.setSpeciesFilter();      
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
        decr() {
          if (this.amount > 0) {
            this.amount--;
          }
        },
        incr() {
          this.amount++;
        },
        applyFiltersAndSort() {
          let that = this;
          let species = Object.keys(this.dice).filter(species => that.speciesFilter === '' || species === that.speciesFilter);
          let dice = []

          species.forEach(species => {
              let editions = Object.keys(that.dice[species]).filter(edition => that.editionFilter === '' || that.editionFilter === edition);
              editions.forEach(edition => dice = dice.concat(that.dice[species][edition].map(die => {
                return {...die, edition,}
              })));
          });

          let sizes = [];
          let types = [];
          dice.forEach( die => {
            sizes.push(die.rarity);
            types.push(die.type);
          });

          sizes = [...new Set(sizes)];
          types = [...new Set(types)];

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
            } else if (that.sortColumn == 3) {
              return that.sortDirection * a.edition.localeCompare(b.edition);
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
        changeEditionDirection() {
          if (this.sortColumn != 3) {
            this.sortColumn = 3;
            this.sortDirection = 1;
          } else {
            this.sortDirection *= -1;
          }
          this.filteredDice = this.applyFiltersAndSort();
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
        setCurrentDie(collectionDie) {
          let that = this;
          let added = false;
          let newDie = {...collectionDie};
          newDie.amount = this.amount;
          this.expand(`${newDie.name}/${newDie.edition}`);
          this.myCollection.forEach(die => {
            if(die.name === newDie.name && die.edition === newDie.edition) {
              die.amount += that.amount;
              added = true;
            }
          });

          if(!added) {
            this.myCollection.push(newDie);
          }
          this.amount = 0;
          saveCollection('collections', this.myCollection);
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.diceBrowserTour = false;
          saveCollection('profiles', profile);
        },
        setSpeciesFilter: function() {
            this.editionFilter = '';
            this.filteredDice = this.applyFiltersAndSort();
            let editions = [];
            for (let edition in this.dice[this.speciesFilter]) {
              editions.push(edition);
            }
            this.editions = editions;
        },
        setEditionFilter: function() {
            this.filteredDice = this.applyFiltersAndSort();
        },
        setSizeFilter: function() {
            this.filteredDice = this.applyFiltersAndSort();
        },
        setTypeFilter: function() {
            this.filteredDice = this.applyFiltersAndSort();
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
    grid-template-columns: auto;
    grid-template-rows: auto 1fr;
    align-items: center;
    justify-items: center;
  }

  #dice .header {
    width: 100%;
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
    align-items: center;
    justify-items: center;
  }

  #dice .body {
    width: 100%;
  }

  .add-die {
    grid-area: 2 / 1 / 2 / 5;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    gap: .5em;
  }

  #expansion {
    display: none;
    width: 100%;
    border: 1px solid black;
  }

  .row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    justify-items: center;
    align-items: center;
    gap: .25em;
  }

  .edition {
    grid-column: 2;
    grid-row: 1;
    width: 25%;
  }

  .size {
    grid-column: 3;
    grid-row: 1;
    width: 25%;
  }

  .type {
    grid-column: 4;
    grid-row: 1;
    width: 25%;
  }

  .add-button {
    grid-column: 5;
    grid-row: 1;
    font-size: 24px;
    width: 25%;
  }

  .die-id {
    grid-column: 1;
    grid-row: 1;
    display: grid;
    justify-items: center;
    width: 25%;
  }

  .column-header {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .sort-icon {
    font-size: 24px;
  }
</style>