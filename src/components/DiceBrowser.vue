<template>
    <v-tour name="diceBrowserTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="dice-browser">
      <h1>Dice Browser</h1>
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
              <div v-for="die in filteredDice" :key="die.name + '/' + die.edition" class="row">
                  <div class="die-id"><img :src="'../images/dice/' + die.id"/><div>{{die.name}}</div></div>
                  <div>{{die.rarity}}</div>
                  <div>{{die.type}}</div>
                  <div class="add-button"><span @click="() => setCurrentDie(die)" class="material-icons material-icons-outlined">add</span></div>
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
      if (profile.diceBrowserTour || profile.diceBrowserTour === undefined) {
        this.$tours['diceBrowserTour'].start();
      }

      this.speciesFilter = this.$store.state.filters.species;
      this.editionFilter = this.$store.state.filters.edition;
      
      let that = this;
      this.editions = this.menu[this.speciesFilter];
      this.filteredDice = this.$store.state.dice.filter(die => die.species === that.speciesFilter && die.edition === that.editionFilter);
    },
    methods: {
        ...mapActions(['setCollectionDie', 'setFilters']),
        setCurrentDie(die) {
          die.amount = 1;
          this.setCollectionDie(die);
          this.$router.push('/armylists');
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.diceBrowserTour = false;
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
            this.filteredDice = this.$store.state.dice.filter(die => die.species === that.speciesFilter && die.edition === that.editionFilter);
        },
    },
};
</script>

<style scope>
  .dice-browser {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-content: center;
    justify-content: center;
    gap: .5em;
  }

  .dice-browser h1 {
    align-self: center;
    justify-self: center;    
  }

  .dice-browser .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
    padding: .25em;
  }

  .dice-browser .element > label {
    font-weight: bold;
    justify-self: end;
    align-self: center;
    padding-right: .5em;
  }

  .dice-browser select {
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
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-items: center;
    align-items: center;
  }

  .add-button {
    font-size: 24px;
  }

  .die-id {
    display: grid;
    grid-template-rows: 1fr 1fr;
    justify-items: center;
  }
</style>