<template>
    <div class="collections">
      <h1>Profile for {{(profile != null) ? profile.displayName : ''}}</h1>
      <div v-if="profile.discord_number && profile.discord_number !== ''" class="element"><label for="discord">Discord</label><div id="discord"><a :href="`http://discordapp.com/users/${profile.discord_number}`" target="_blank">{{(profile.discord && profile.discord !== '') ? profile.discord : 'ID'}}</a></div></div>
      <div v-if="profile.facebook && profile.facebook !== ''" class="element"><label for="facebook">Facebook</label><a id="facebook" :href="`https://facebook.com/${profile.facebook}`" target="_blank">{{profile.facebook}}</a></div>
      <div v-if="profile.isCollectionPublic">
        <h1>Their Dice Collection</h1>
        <div id="dice">
            <div class="header">
                <div>ID</div>
                <div>Set</div>
                <div>Size</div>
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
      dice: [],
    };
  },
  methods: {
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
          if (die.species === 'Item') {
              if (die.rarity !== 'Artifact') {
                  newDie.rarity = `${die.rarity} Equipment`
              }
              newDie.species = 'Equipment';
          }
          if (die.species === 'Medallion') {
              newDie.species = 'Equipment';
          }
          if (die.species === 'Relic') {
              newDie.species = 'Equipment';
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
