<template>
  <div class="profiles">
      <div class="collections">
          <div class="header">
            <h1>Profile for {{(profile != null) ? profile.displayName : ''}}</h1>
            <div v-if="profile.discord_number && profile.discord_number !== ''" class="element"><label for="discord">Discord</label><div id="discord"><a :href="`http://discordapp.com/users/${profile.discord_number}`" target="_blank">{{(profile.discord && profile.discord !== '') ? profile.discord : 'ID'}}</a></div></div>
            <div v-if="profile.facebook && profile.facebook !== ''" class="element"><label for="facebook">Facebook</label><a id="facebook" :href="`https://facebook.com/${profile.facebook}`" target="_blank">{{profile.facebook}}</a></div>
            <h1 v-if="profile.isCollectionPublic">Their Dice Collection</h1>
            <span class="dice">
              <div v-if="profile.isCollectionPublic" class="header">
                  <div>ID</div>
                  <div>Edition</div>
                  <div>Size</div>
                  <div>Type</div>
                  <div>Amount</div>
              </div>
            </span>
          </div>
            <div v-if="profile.isCollectionPublic" class="body">
                <div v-for="die in dice" :key="die.name + '/' + die.edition" :id="die.name + '/' + die.edition" class="row">
                    <div class="die-id"><img :src="getImageID(die)"/><div>{{die.name}}</div></div>
                    <div class="edition">{{die.edition}}</div>
                    <div class="size">{{die.rarity}}</div>
                    <div class="type">{{die.type}}</div>
                    <div class="amount">{{die.amount}}</div>
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
      profile: {},
      sourceDice: [],
      dice: [],
    };
  },
  methods: {
    getImageID(die) {
      const dice = this.sourceDice.filter(sourceDie => sourceDie.name === die.name && sourceDie.editions.includes(die.edition));
      return dice[0].id; 
    },
  },
  async mounted() {
    const usernames = await getEntireCollection('usernames');
    const uid = usernames[this.$route.params.id] || this.$route.params.id;
    this.profile = await getCollectionByField('profiles', uid);
    this.profile.displayName = this.profile.name;

    if( this.profile.displayName === undefined || this.profile.displayName === '' ) {
      this.profile.displayName = this.$route.params.id;
    }

    if (this.profile.isCollectionPublic) {
      this.sourceDice = await getEntireCollection('dice');
      this.dice = await getCollectionByField('collections', uid) || [];
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

      this.dice.sort((a,b) => {
        let result = a.name.localeCompare(b.name);
        if (result == 0) {
          return a.edition.localeCompare(b.edition);
        }

        return result;
      });
    }
  },
}
</script>

<style scoped>
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
  }

  .collections .header h1 {
    text-align: center;
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
