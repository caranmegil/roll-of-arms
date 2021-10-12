<template>
    <v-tour name="collectionTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="collections">
      <h1>Army Lists Manager</h1>
      <button id="locate" @click="browseDice">Locate</button>
      <span id="filters">
        <div class="element">
            <label for="speciesFilter">Species</label>
            <select id="speciesFilter" v-model="speciesFilter" @change="setSpeciesFilter">
                <option value="Amazon">Amazons</option>
                <option value="Coral Elf">Coral Elves</option>
                <option value="Dracolem">Dracolem</option>
                <option value="Dragon">Dragons</option>
                <option value="Dragonkin">Dragonkin</option>
                <option value="Dwarf">Dwarves</option>
                <option value="Eldarim">Eldarim</option>
                <option value="Eldarim, Black">Eldarim, Black</option>
                <option value="Eldarim, Blue">Eldarim, Blue</option>
                <option value="Eldarim, Green">Eldarim, Green</option>
                <option value="Eldarim, Gold">Eldarim, Gold</option>
                <option value="Eldarim, Red<">Eldarim, Red</option>
                <option value="Frostwings">Frostwings</option>
                <option value="Ferals">Ferals</option>
                <option value="Firewalkers">Firewalkers</option>
                <option value="Goblins">Goblins</option>
                <option value="Item">Item</option>
                <option value="Lava Elves">Lava Elves</option>
                <option value="Medallion">Medallion</option>
                <option value="Minor Terrain">Minor Terrain</option>
                <option value="Relic">Relic</option>
                <option value="Royalty">Royalty</option>
                <option value="Scalders">Scalders</option>
                <option value="Swamp Stalkers">Swamp Stalkers</option>
                <option value="Terrain">Terrain</option>
                <option value="Treefolk">Treefolk</option>
                <option value="Undead">Undead</option>
            </select>
        </div>
        <div class="element">
            <label for="editionFilter">Edition</label>
            <select id="editionFilter" v-model="editionFilter" @change="setEditionFilter">
                <option v-for="option in editions" :selected="(editions.length > 0 && editions[0] === option) ? 'true' : 'false'" :key="option" :value="option">{{option}}</option>
            </select>
        </div>
      </span>

      <div class="separator"></div>

      <div id="dice">
          <div class="header">
              <div>ID</div>
              <div>Rarity</div>
              <div>Type</div>
          </div>
          <div class="body">
              <div v-for="(die, index) in filteredDice" :key="die.name + '/' + die.edition" :id="die.name + '/' + die.edition" class="row">
                  <div class="die-id"><img :src="'../images/dice/' + die.id"/><div>{{die.name}}</div></div>
                  <div>{{die.rarity}}</div>
                  <div>{{die.type}}</div>
                  <div><input type="number" v-model="die.amount" @keyup="() => changeAmount(index)" @change="() => changeAmount(index)"></div>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import 'es6-promise/auto';
import { getCollection, saveCollection } from '@/firebase';

export default {
    name: 'DiceBrowser',
    data() {
        return {
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
                content: 'Set your species and edition filters here.',
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
            dice: [],
            filteredDice: [],
            speciesFilter: 'Amazon',
            editionFilter: null,
            editions: [],
            menu: {
                'Amazon': ['-', 'Reprint', 'Alt-Ink'],
                'Coral Elf': ['-'],
                'Dwarf': ['-'],
                'Frostwings': ['-', 'Reprint', 'Alt-Ink', 'Promos'],
                'Ferals': ['-', 'Alt-Ink'],
                'Firewalkers': ['-'],
                'Goblins': ['-'],
                'Lava Elves': ['-'],
                'Scalders': ['-', 'Reprint', 'Promos'],
                'Swamp Stalkers': ['-', 'Dark', 'Alt-Ink', 'Purple-Ink'],
                'Treefolk': ['-'],
                'Undead': ['-'],
                'Eldarim': ['-'],
                'Eldarim, Black': ['-'],
                'Eldarim, Blue': ['-'],
                'Eldarim, Green': ['-'],
                'Eldarim, Gold': ['-'],
                'Eldarim, Red': ['-'],
                'Dragon': ['-'],
                'Dragonkin': ['-'],
                'Medallion': ['-'],
                'Item': ['-'],
                'Royalty': ['-'],
                'Dracolem': ['-'],
                'Relic': ['-'],
                'Terrain': ['-'],
                'Minor Terrain': ['-']
            },
        };
    },
    async mounted() {
      const profile = await getCollection('profiles');
      if (profile.collectionTour || profile.collectionTour === undefined) {
        this.$tours['collectionTour'].start();
      }

      this.dice = await getCollection('collections') || [];
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
      
      let that = this;
      this.editions = this.menu[this.speciesFilter];
      this.filteredDice = this.dice.filter(die => die.species === that.speciesFilter && die.edition === that.editionFilter);
    },
    unmounted() {
      this.setCollectionDie(null);
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
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
            }).filter(die => die.amount > 0);
            saveCollection('collections', this.dice);
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
            this.editions = this.menu[this.speciesFilter];
            this.editionFilter = this.editions[0];
            this.setEditionFilter();
        },
        setEditionFilter: function() {
            let that = this;
            this.setFilters({species: this.speciesFilter, edition: this.editionFilter});
            this.filteredDice = this.dice.filter(die => die.species === that.speciesFilter && die.edition === that.editionFilter);
            this.filteredDice.sort( (a, b) => a.name.localeCompare(b.name) );
        },
    },
};
</script>

<style scope>
  .collections {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-content: center;
    justify-content: center;
    gap: .5em;
  }

  .collections h1 {
    align-self: center;
    justify-self: center;    
  }

  .collections .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding: .25em;
  }

  .collections .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: center;
    padding-right: .5em;
  }

  .collections select {
    border-radius: .25em;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  #dice {
    height: 60vh;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  #dice div.header {
    margin-bottom: .75em;
    border-bottom: 1px solid black;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-weight: bold;
    align-items: center;
    justify-items: center;
  }

  #dice div.row {
    padding-top: .5em;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

</style>