<template>
    <div class="collections">
      <h1>Profile for {{(profile != null) ? profile.name : ''}}</h1>
      <h1>Their Collection</h1>

      <div id="dice">
          <div class="header">
              <div>ID</div>
              <div>Edition</div>
              <div>Rarity</div>
              <div>Type</div>
              <div></div>
          </div>
          <div class="body">
              <div v-for="die in dice" :key="die.name + '/' + die.edition" :id="die.name + '/' + die.edition" class="row">
                  <div class="die-id"><img :src="'../../images/dice/' + die.id"/><div>{{die.name}}</div></div>
                  <div>{{die.edition}}</div>
                  <div>{{die.rarity}}</div>
                  <div>{{die.type}}</div>
                  <div>{{die.amount}}</div>
              </div>
          </div>
      </div>
    </div>
</template>

<script>
import {
  getCollectionByField,
  getEntireCollection,
} from '@/firebase';
import 'es6-promise/auto';

export default {
  name: 'ProfileView',
  props: {
  },
  data() {
    return {
      profile: null,
      dice: [],
    };
  },
  methods: {
    setSpeciesFilter: function() {
        this.editions = this.menu[this.speciesFilter];
        this.editionFilter = this.editions[0];
        this.setEditionFilter();
    },
    setEditionFilter: function() {
        let that = this;
        this.filteredDice = this.dice.filter(die => die.species === that.speciesFilter && die.edition === that.editionFilter);
    },
    back: function () {
      this.$router.push('/');
    }
  },
  async mounted() {
    const usernames = await getEntireCollection('usernames');
    const uid = usernames[this.$route.params.id] || this.$route.params.id;
    this.profile = await getCollectionByField('profiles', uid) || {};
    this.dice = await getCollectionByField('collections', uid) || [];
    this.dice.sort((a,b) => {
      let result = a.name.localeCompare(b.name);
      if (result == 0) {
        return a.edition.localeCompare(b.edition);
      }

      return result;
    });
  },
}
</script>

<style scoped>
  .profiles {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: auto;
    align-content: center;
    justify-content: center;
    gap: .5em;
  }

  .profiles h1 {
    align-self: center;
    justify-self: center;    
  }

  .profiles .element {
    align-self: center;
    justify-self: center;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 1fr 1fr;
  }

  .profiles .element > label {
    font-weight: bold;
    justify-self: start;
    align-self: start;
  }

  .separator {
    border-bottom: 1px solid #D3D3D3;
  }

  .error {
      align-self: center;
      justify-self: center;
      color: red;
  }

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
