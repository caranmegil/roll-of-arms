<template>
    <v-tour name="collectionTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="collections">
      <div class="header">
        <h1>My Collection</h1>
        <div class="element">
          <label for="privacy">Make Public</label>
          <input type="checkbox" v-model="profile.isCollectionPublic" @change="saveTheProfile"/>
        </div>
        <button id="locate" @click="browseDice">Add Dice</button>
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
                  <option v-for="option in editions" :selected="(editions.length > 0 && editions[0] === option) ? 'true' : 'false'" :key="option" :value="option">{{option}}</option>
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

        <div class="separator"></div>
        <span class="dice">
            <div class="header">
                <div class="column-header" @click="changeNameDirection">ID <span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                <div class="column-header" @click="changeEditionDirection">Edition  <span v-if="sortColumn == 3 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 3 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                <div class="column-header" @click="changeSizeDirection">Size  <span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                <div class="column-header" @click="changeTypeDirection">Type  <span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons mateiral-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons mateiral-icons-outlined">expand_more</span></div>
                <div>Amount</div>
            </div>
        </span>
      </div>
      <div class="dice">
        <div class="body">
          <div v-for="(die, index) in filteredDice" :key="die.name + '/' + die.edition" :id="die.name + '/' + die.edition" class="row">
              <div class="die-id"><img :src="getImageID(die)"/><div>{{die.name}}</div></div>
              <div class="edition">{{die.edition}}</div>
              <div class="size">{{die.rarity}}</div>
              <div class="type">{{die.type}}</div>
              <div class="amount"><input type="number" v-model="die.amount" @keyup="() => changeAmount(index)" @change="() => changeAmount(index)"></div>
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
                content: 'Set your species/set and edition filters here.',
              },
              {
                target: '#locate',
                header: {
                  title: 'Locate Die!',
                },
                content: 'Press this button to locate dice to add using the dice browser.',
              },
              {
                target: '.body',
                header: {
                  title: 'The Dice!',
                },
                content: 'Scroll through this list and locate the die you want and modify your collection.  Changing the amount to 0 removes it.',
                params: {
                  placement: 'auto',
                },
              },
            ],
            sourceDice: [],
            dice: [],
            filteredDice: [],
            speciesFilter: '',
            species: [],
            editionFilter: '',
            editions: [],
            sizes: [],
            sizeFilter: '',
            types: [],
            typeFilter: '',
            timerHandle: null,
        };
    },
    async mounted() {
      this.sourceDice = await getEntireCollection('dice');
      this.profile = await getCollection('profiles') || {};
      if (this.profile.collectionTour || this.profile.collectionTour === undefined) {
        this.$tours['collectionTour'].start();
      }

      if (this.profile.isCollectionPublic === undefined) {
        this.profile.isCollectionPublic = false;
      }

      this.dice = await getCollection('collections') || [];
      this.dice = this.dice.map(die => {
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
      if (this.$store.state.collectionDie != null) {
        const collectionDie = this.$store.state.collectionDie;
        if (this.dice.filter(die => die.name === collectionDie.name && die.edition === collectionDie.edition).length > 0) {
          this.dice.forEach(die => {
            if(die.name === collectionDie.name && die.edition === collectionDie.edition) {
              if (die.amount === undefined) {
                die.amount = 0;
              }
              die.amount += collectionDie.amount;
            }
          });
        } else {
          this.dice.push(this.$store.state.collectionDie);
        }
        saveCollection('collections', this.dice);
        this.setCurrentDie(null);
      }

      this.speciesFilter = this.$store.state.filters.species;
      this.editionFilter = this.$store.state.filters.edition;
      this.sizeFilter = this.$store.state.filters.size;
      this.typeFilter = this.$store.state.filters.type;
      
      let species = [];
      this.dice.forEach(die => species.push(die.species));

      species = [...new Set(species)].sort();
      this.species = species;

      this.setSpeciesFilter();
      this.timerHandle = setInterval(this.saveAndClear, 5000);
    },
    unmounted() {
      clearInterval(this.timerHandle);
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
        saveAndClear() {
          this.dice = this.dice.filter(die => die.amount > 0);
          saveCollection('collections', this.dice);
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
        changeEditioneDirection() {
          if (this.sortColumn != 3) {
            this.sortColumn = 3;
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
          let dice = this.dice.filter(  die =>
                                        (that.speciesFilter === '' || die.species === that.speciesFilter)
                                        && (that.editionFilter === '' || die.edition === that.editionFilter)
                                      );

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
        getImageID(die) {
          const dice = this.sourceDice.filter(sourceDie => sourceDie.name === die.name && sourceDie.editions.includes(die.edition));
          return dice[0].id; 
        },
        saveTheProfile() {
          saveCollection('profiles', this.profile);
        },
        browseDice() {
          this.$router.push('/dicebrowser');
        },
        changeAmount(index) {
          if (this.filteredDice[index]&& !isNaN(this.filteredDice[index].amount)) {
            let newDie = this.filteredDice[index];
            this.dice = this.dice.map(die => {
              if (die.species === newDie.species && die.edition === newDie.edition && die.name === newDie.name) {
                return newDie;
              }

              return die;
            });
          }
        },
        setCurrentDie(die) {
          this.setCollectionDie(die);
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.collectionTour = false;
          saveCollection('profiles', profile);
        },
        setSpeciesFilter: function() {
            this.editionFilter = '';
            this.filteredDice = this.applyFiltersAndSort();
            let editions = [];
            this.dice.filter(die => die.species === this.speciesFilter).forEach(die => editions.push(die.edition));
            editions = [...new Set(editions)];
            editions.sort();
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
   button {
     width: 10em;
   }
  .collections {
    width: 100%;
    display: grid;
    justify-items: center;
  }

  .collections .header {
    width: 100%;
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
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    font-weight: bold;
    align-items: center;
    justify-items: center;
  }

  .body {
    width: 100%;
  }

  .body .row {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .sort-icon {
    font-size: 24px;
  }

  .die-id {
    grid-column: 1;
    grid-row: 1;
    display: grid;
    justify-items: center;
    width: 20%;
  }

  .edition {
    grid-column: 2;
    grid-row: 1;
    width: 20%;
  }

  .size {
    grid-column: 3;
    grid-row: 1;
    width: 20%;
  }

  .type {
    grid-column: 4;
    grid-row: 1;
    width: 20%;
  }

  .amount {
    grid-column: 5;
    grid-row: 1;
    width: 20%;
  }
</style>