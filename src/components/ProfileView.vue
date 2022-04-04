<template>
  <div class="profiles">
      <div v-if="isVisible" class="collections">
          <div class="header">
            <h1>Profile for {{(profile != null) ? profile.displayName : ''}}</h1>
            <div v-if="profile.discord_number && profile.discord_number !== ''" class="element"><label for="discord">Discord</label><div id="discord"><a :href="`http://discordapp.com/users/${profile.discord_number}`" target="_blank">{{(profile.discord && profile.discord !== '') ? profile.discord : 'ID'}}</a></div></div>
            <div v-if="profile.facebook && profile.facebook !== ''" class="element"><label for="facebook">Facebook</label><a id="facebook" :href="`https://facebook.com/${profile.facebook}`" target="_blank">{{profile.facebook}}</a></div>
            <h1 v-if="profile.isCollectionPublic">Their Dice Collection</h1>
            <span v-if="profile.isCollectionPublic" id="filters">
            </span>
          </div>
            <div v-if="profile.isCollectionPublic" class="body">
              <DiceCollectionWidget :sourceDice="sourceDice" :profile="profile" :uid="uid"/>
            </div>
            <div class="body">
              <ProfileForces :sourceDice="sourceDice" :uid="uid"/>
            </div>
          </div>
      </div>
</template>

<script>
import {
  getCollectionByField,
  getEntireCollection,
  getCurrentUser,
} from '@/firebase';
import 'es6-promise/auto';

import ProfileForces from './ProfileForces.vue';
import DiceCollectionWidget from './DiceCollectionWidget.vue';

export default {
  name: 'ProfileView',
  components: {
    DiceCollectionWidget,
    ProfileForces,
  },
  data() {
    return {
      observer: null,
      sortColumn: 0,
      sortDirection: 1,
      profile: {},
      uid: null,
      sourceDice: [],
      dice: [],
      filteredDice: [],
      diceGroupedByEdition: {},
      speciesFilter: '',
      species: [],
      sizes: [],
      sizeFilter: '',
      types: [],
      typeFilter: '',
      isVisible: false,
    };
  },
  methods: {
    getImageID(die) {
      const dice = this.sourceDice.filter(sourceDie => sourceDie.name === die.name && sourceDie.editions.includes(die.edition));
      return dice[0].id; 
    },
    changeNameDirection() {
      if (this.sortColumn != 0) {
        this.sortColumn = 0;
        this.sortDirection = 1;
      } else {
        this.sortDirection *= -1;
      }
      this.isLoading=true;
      this.filteredDice = this.applyFiltersAndSort();
      this.isLoading=false;
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
        this.observer.observe(expansion);
      } else {
        expansion.style.display = 'none';
        actionButton.innerText = 'expand_more';
      }

      row.classList.toggle('highlight');
    },
    setSpeciesFilter() {
        this.isLoading = true;
        this.sizeFilter = '';
        this.typeFilter = '';
        this.filteredDice = this.applyFiltersAndSort();
        this.isLoading = false;
    },
    setSizeFilter() {
        this.isLoading = true;
        this.filteredDice = this.applyFiltersAndSort();
        this.isLoading = false;
    },
    setTypeFilter() {
        this.isLoading = true;
        this.filteredDice = this.applyFiltersAndSort();
        this.isLoading = false;
    },
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
    const usernames = await getEntireCollection('usernames');
    this.uid = usernames[this.$route.params.id] || this.$route.params.id;
    this.profile = await getCollectionByField('profiles', this.uid);
    const currentUser = getCurrentUser();

    this.isVisible = this.profile.visibility === '2' 
      || (currentUser != null && this.profile.visibility == '1')
      || (currentUser != null && this.uid === currentUser.uid && this.profile.visibility === '0');
  
    if (this.isVisible) {
      this.profile.displayName = this.profile.name;

      if( this.profile.displayName === undefined || this.profile.displayName === '' ) {
        this.profile.displayName = this.$route.params.id;
      }

      if (this.profile.isCollectionPublic) {
        this.sourceDice = await getEntireCollection('dice');
      } else {
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  },
}
</script>

<style scoped>
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
  }

  .collections .header h1 {
    text-align: center;
    align-self: center;
    justify-self: center;    
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
    width: 99%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
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

  .highlight {
    background-color: #fff;
    border: 1pt solid black;
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
