<template>
    <v-tour name="forcesTour" :steps="steps" :callbacks="tourCallbacks"></v-tour>
    <div class="collections">
      <Loading v-model:active="isLoading"/>
      <div class="alert-box" :style="{visibility: willShowMessage ? 'visible' : 'hidden'}">{{message}}</div>
      <div class="dialog" :style="{visibility: willShowConfirmation ? 'visible' : 'hidden'}">
        <div @click="onNo" class="modal-overlay"/>
        <div class="modal yes-no">
          <div>Are you sure you want to delete "{{this.myForce > -1 && this.myForces[this.myForce] ? this.myForces[this.myForce].name : ''}}"?</div>
          <div class="element">
            <button id="noBtn" @click="onNo">Cancel</button>
            <button id="yesBtn" @click="onYes">Delete</button>
          </div>
        </div>
      </div>
      <div class="dialog" :style="{visibility: willShowForcesSelector ? 'visible' : 'hidden'}">
        <div @click="expandForcesSelector" class="modal-overlay"/>
          <div class="modal">
            <MyForcesSelector class="forces-selector" :my-force="this.myForce" :my-forces="this.myForces || []" @onNewForce="() => { onNewForce(); expandForcesSelector(); }" @onForceChanged="(forceName) => { loadForce(forceName); expandForcesSelector(); }"/>
          </div>
      </div>
      <div class="header" v-if="myForces != null && myForce > -1">
        <div @click="expandForcesSelector" class="open-forces-selector"><h2>Forces <div id="force-action-button" class="material-icons material-icons-outlined">expand_more</div></h2></div>
        <div class="element">
          <label for="forceName">Force Name</label>
          <input type="text" id="forceName" v-model="forceName" @change="saveTheForces"/>
        </div>
        <button id="deleteBtn" @click="deleteCurrentForce"><span class="material-icons material-icons-outlined" style="font-size: 16px !important;">delete</span> Delete</button>
        <div class="element">
          <label for="privacy">Show With Profile</label>
          <input type="checkbox" id="privacy" v-model="myForces[myForce].isPublic" @change="saveTheForces"/>
        </div>
        <span id="filters">
          <div class="element">
              <label for="forceFilter">Dice Group</label>
              <select id="forceFilter" v-model="forceSlot" @change="setForcesSlot">
                  <option value="Home" selected="selected">Home Army</option>
                  <option value="Home Terrain">Home Terrain</option>
                  <option value="Horde">Horde Army</option>
                  <option value="Campaign">Campaign Army</option>
                  <option value="Frontier Terrain">Frontier Terrain</option>
                  <option value="Summoning">Summoning Pool</option>
              </select>
          </div>
          <div class="element"><label for="totalPoints">Total Points</label><div id="totalPoints">{{totalPoints}}</div></div>
        </span>

        <button id="locate" @click="browseDice">Add Dice</button>

        <div class="separator"></div>
        <span class="dice">
            <div class="header">
                <div class="column-header die-id" @click="changeNameDirection">Name <span v-if="sortColumn != 0" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 0 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 0 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div class="column-header size" @click="changeSizeDirection">Size  <span v-if="sortColumn != 1" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 1 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 1 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div class="column-header type" @click="changeTypeDirection">Type  <span v-if="sortColumn != 2" class="material-icons material-icons-outlined">unfold_more</span><span v-if="sortColumn == 2 && sortDirection == -1" class="sort-icon material-icons material-icons-outlined">expand_less</span><span v-if="sortColumn == 2 && sortDirection == 1" class="sort-icon material-icons material-icons-outlined">expand_more</span></div>
                <div></div>
            </div>
        </span>
      </div>
      <div class="dice">
        <div class="body" v-if="myForces !== undefined && myForce > -1 && myForces[myForce] !== undefined">
          <div v-for="die in myForces[myForce].slots[forceSlot]" :key="die.sfrID" :id="die.sfrID" class="row">
              <div @click="() => expand(die)" class="die-id"><img :src="getImageID(die)"/><div>{{die.name}} ({{die.amount}})</div></div>
              <div @click="() => expand(die)" class="size">{{die.rarity}}</div>
              <div @click="() => expand(die)" class="type">{{die.type}}</div>
              <div @click="() => expand(die)" class="add-button"><span id="action-button" class="material-icons material-icons-outlined">expand_more</span></div>
              <div id="expansion">
                <div class="add-die">
                  <span @click="() => decr(die)" class="material-icons material-icons-outlined">remove</span>
                  <div class="amount"><input type="number" v-model="die.amount" @keyup="() => changeAmount(die)" @change="() => changeAmount(die)"></div>
                  <span @click="() => incr(die)" class="material-icons material-icons-outlined">add</span>
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
} from '@/utils';
import 'es6-promise/auto';
import MyForcesSelector from '@/components/MyForcesSelector.vue';
import {
  getCollection,
  saveCollection,
  getEntireCollection,
  getCollectionOn,
} from '@/firebase';

export default {
    name: 'MyForces',
    components: {
      Loading,
      MyForcesSelector,
    },
    data() {
        return {
            totalPoints: '0 / 0',
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
                content: 'Set your area of forces filters here.',
              },
              {
                target: '#locate',
                header: {
                  title: 'Add Die!',
                },
                content: 'Press this button to locate dice to add using the forces dice browser.',
              },
              {
                target: '.body',
                header: {
                  title: 'The Dice!',
                },
                content: 'Scroll through this list and locate the die you want and modify your forces.  Changing the amount to 0 removes it.',
                params: {
                  placement: 'auto',
                },
              },
            ],
            sourceDice: [],
            myForce: -1,
            myForces: [],
            filteredDice: [],
            forceSlot: 'Home',
            forceName: '',
            isLoading: true,
            observer: null,
            willShowConfirmation: false,
            willShowForcesSelector: false,
            willShowMessage: false,
            message: '',
        };
    },
    async unmounted() {
      this.setMyForces(this.myForces);
    },
    async mounted() {
      let that = this;

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

      this.sourceDice = await getEntireCollection('dice');
      this.myForces = this.getMyForces();
      if (this.myForces == null) {
        this.myForces = await getCollection('forces') || [];
      }
      
      if (this.myForces == null) {
        this.myForces = [];
      }

      this.setMyForces(this.myForces);

      if (this.getForceName() && this.getForceName() !== '') {
        this.loadForce(this.getForceName());
      } else if (this.myForces == null || this.myForces.length == 0) {
        this.onNewForce();
      } else {
        this.loadForce();
      }
      this.isLoading = false;
      getCollectionOn('forces', (forces) => {
        that.myForces = forces || [];
        that.loadForceData();
      });

      this.profile = await getCollection('profiles') || {};
      if (this.profile.forcesTour || this.profile.forcesTour === undefined) {
        this.$tours['forcesTour'].start();
      }
    },
    methods: {
        ...mapActions(['setForceSlot', 'setFilters', 'setMyForces', 'setForceName']),
        ...mapGetters(['getMyForces', 'getForceName']),
        async onYes() {
          this.willShowConfirmation = false;

          let that = this;
          let newMyForces = this.myForces.filter( force => force.name !== that.myForces[that.myForce].name);
          if (!newMyForces) {
            newMyForces = [];
            this.myForce = this.myForces.length > 0 ? 0 : -1;
          }
          this.setMyForces(newMyForces);
          saveCollection('forces', newMyForces);

          if (newMyForces.length == 0) {
            this.onNewForce();
          } else {
            this.loadForce();
          }
        },
        onNo() {
          this.willShowConfirmation = false;
        },
        deleteCurrentForce() {
          this.willShowConfirmation = true;
        },
        loadForceData() {
          this.forceName = this.myForces[this.myForce].name;
          this.setForceName(this.myForces[this.myForce].name);

          resetSlots(this.myForces[this.myForce]);

          if (this.myForces[this.myForce].isPublic === undefined) {
            this.myForces[this.myForce].isPublic = false;
          }

          this.forceSlot = this.$store.state.forceSlot || 'Home';

          this.recalcTotals();

          this.isLoading = false;
        },
        onNewForce() {
          this.isLoading = true;
          const myForcesLen = this.myForces != null ? this.myForces.length + 1 : 1;
          const myForce = {isPublic: false, name: `New Force #${myForcesLen}`}

          this.myForces.push(myForce);
          this.myForce = this.myForces.length - 1;

          this.setMyForces(this.myForces);
          this.loadForceData(myForce);
          this.saveTheForces();
        },
        async loadForce(name) {
          let that = this;
          this.myForce = -1;
          if (name !== undefined) {
            this.myForces.forEach( (force, index) => {
              if (force.name === name) {
                that.myForce = index;
              }
            });
          } else {
            this.myForce = 0;
          }

          this.loadForceData();
          this.saveTheForces();
        },
        decr(die) {
          if (die.amount > 0) {
            die.amount--;
            this.recalcTotals();
            this.saveTheForces();
          }
        },
        incr(die) {
          if (die.rarity.includes('Terrain')) {
            die.amount = 1;
          } else {
            die.amount++;
          }
          this.recalcTotals();
          this.saveTheForces();
        },
        expandForcesSelector() {
          this.willShowForcesSelector = !this.willShowForcesSelector;
        },
        expand(die) {
          let row = document.getElementById(die.name);
          let actionButton = row.querySelector('#action-button');
          let expansion = row.querySelector('#expansion');
          let allExpansions = document.querySelectorAll('#expansion');
          this.edAmnt = 0;

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
        // exportCurrentForce() {
        //   if (this.myForce !== undefined && this.myForce.name !== undefined) {
        //     const a = document.createElement('a');
        //     a.href = URL.createObjectURL( new Blob([JSON.stringify(this.myForce)], { type: 'text/json' }) );
        //     a.download = `${encodeURI(this.myForce.name)}.json`;
        //     a.click();
        //   }
        // },
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
        applyFiltersAndSort() {
          let that = this;

          let dice = this.myForces[this.myForce][this.forceSlot];

          dice.forEach(die => {
            let namesArr = that.diceGroupedByEdition[die.name];
            if (namesArr === undefined) {
              namesArr = [];
              that.diceGroupedByEdition[die.name] = namesArr;
            }

            namesArr.push(die);
          });

          return dice;
        },
        getImageID(die) {
          const filteredDie = this.sourceDice.filter(sourceDie => sourceDie.name === die.name)[0] || {};
          return filteredDie.id; 
        },
        async saveTheForces() {
          let that = this;
          if (this.forceName && this.forceName.trim() !== '') {
            this.willShowMessage = false;
            if (this.myForces[this.myForce].name === this.forceName || this.myForces.filter(force => force.name === that.forceName).length == 0) {
              this.myForces[this.myForce].name = this.forceName;
              this.setMyForces(this.myForces);
              await saveCollection('forces', this.myForces);
            } else {
              this.message = 'There is a force already with that name!';
              this.willShowMessage = true;
            }
          }
        },
        browseDice() {
          this.setForceSlot(this.forceSlot);
          if (this.myForces[this.myForce].name !== undefined && this.myForces[this.myForce].name !== '') {
            this.$router.push('/forcesdicebrowser');
          }
        },
        changeAmount(grDie) {
          if (!isNaN(grDie.amount)) {
            this.myForces[this.myForce][this.forceSlot].map(die => {
              let newDie = {...die};

              if (die.name === grDie.name && die.edition === grDie.edition) {
                newDie.amount = grDie.amount;
              }

              return newDie;
            });

            this.recalcTotals();
            this.saveTheForces();
          }
        },
        weightDie(die, isSummoning) {
          let pointValue = 0;

          if (isSummoning) {
            if (die.species === 'Dragonkin') {
              switch (die.rarity) {
                case 'Small':
                  pointValue = 1;
                  break;
                case 'Medium':
                  pointValue = 2;
                  break;
                case 'Large':
                  pointValue = 3;
                  break;
                default:
                  pointValue = 4;
                  break;
              }
            } else {
              pointValue = 1;
            }
          } else {
            if (die.species === 'Items') {
              switch (die.type) {
                case 'Relic':
                  pointValue = 4;
                  break;
                case 'Medallion':
                  pointValue = 3;
                  break;
                default:
                  if (die.rarity === 'Large Equipment') {
                    pointValue = 2;
                  } else if (die.rarity == 'Small Equipment') {
                    pointValue = 1;
                  }
                  break;
              }
            } else if (die.species === 'Dragons' || die.species === 'Dragonkin' || die.species === 'Terrain') {
              pointValue = 0;
            } else {
              switch (die.rarity) {
                case 'Small':
                  pointValue = 1;
                  break;
                case 'Medium':
                  pointValue = 2;
                  break;
                case 'Large':
                  pointValue = 3;
                  break;
                default:
                  pointValue = 4;
                  break;
              }
            }
          }

          return pointValue;
        },
        flattenForce() {
          let dice = []
          Object.keys(this.myForces[this.myForce].slots).forEach( slotName => slotName !== 'Summoning' ? dice = [...dice, ...this.myForces[this.myForce].slots[slotName]] : dice);
          return dice;
        },
        calcMediumEquipment() {
          let dice = this.flattenForce();
          const totalMediumEquipment = dice.filter(die => die.species === 'Items' && die.rarity === 'Medium Equipment').reduce( (total, die) => total + die.amount, 0);

          return Math.floor(totalMediumEquipment / 2) * 3 + ( (totalMediumEquipment % 2) * 2);
        },
        calcSlotTotal(slot, isSummoning) {
          let that = this;
          let totals = slot.reduce( (prev, current) => prev + that.weightDie(current, isSummoning) * current.amount, 0);
          return totals;
        },
        recalcTotals() {
          let that = this;
          if (this.myForces[this.myForce] !== undefined) {
            this.myForces[this.myForce].slots[this.forceSlot] = this.myForces[this.myForce].slots[this.forceSlot].filter(die => die.amount > 0);
          }
          const myForce = this.myForces[this.myForce];
          if (this.forceSlot === 'Summoning') {
            const totalDKPoints = myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(myForce.slots[this.forceSlot].filter(die => die.species === 'Dragonkin'), true) : 0;
            const totalDragons = myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(myForce.slots[this.forceSlot].filter(die => die.species === 'Dragons'), true) : 0;
            const totalMTs = this.myForce.slots[this.forceSlot] !== undefined ? this.calcSlotTotal(myForce.slots[this.forceSlot].filter(die => die.rarity === 'Minor Terrain'), true) : 0;
            this.totalPoints = `Dragons ${totalDragons} / Kin: ${totalDKPoints} / Minors: ${totalMTs}`;
          } else {
            const forceTotal = (this.myForces[this.myForce] !== undefined) ? Object.keys(myForce.slots).reduce( (total, slotName) => total + that.calcSlotTotal(myForce.slots[slotName]), 0) + this.calcMediumEquipment() : 0;
            const slotTotal =  (this.myForces[this.myForce] !== undefined) ? this.calcSlotTotal(myForce.slots[this.forceSlot], false) : 0;
            this.totalPoints = `${slotTotal} / ${forceTotal}`;
          }
        },
        async noMoreTours() {
          let profile = await getCollection('profiles');
          profile.forcesTour = false;
          saveCollection('profiles', profile);
        },
        setForcesSlot() {
          this.recalcTotals();
        },
    },
};
</script>

<style scoped>
  input {
    width: 5em;
  }

  input#forceName {
    width: 15em;
  }

  button#export {
    width: 32px;
  }

  button {
    width: 10em;
  }

  .collections {
    width: 100%;
    display: grid;
    align-content: center;
    justify-items: center;
    align-items: center;
  }

  .collections .header {
    width: 100%;
    position: sticky;
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
    gap: .75em;
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
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr auto;
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
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .sort-icon {
    font-size: 24px;
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

  .add-die {
    grid-auto-flow: column;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    justify-content: center;
    align-content: center;
    justify-items: start;
    align-items: center;
    gap: .5em;
    padding-left: 1.0em;
  }

  .open-forces-selector {
    width: 100%;
    text-align: center;
  }

  #force-action-button {
    position: relative;
    top: .3em;
  }

  .forces-selector {
    height: 15em;
  }

  .yes-no {
    height: 3.5em;
  }

  .dialog {
    display: grid;
    width: 100%;
    align-items: center;
    justify-items: center;
  }
  .modal {
    display: grid;
    justify-content: center;
    justify-items: center;
    align-items: center;
    align-content: center;
    z-index: 2;
    position: fixed;
    background-color: ivory;
    margin: auto;
    top: 10em;
    width: 20em;
    padding: 1.5em;
    border-radius: .25em;
    border: 1px solid black;
  }
  .modal-overlay {
    background-color: #D3D3D3;
    position: fixed;
    top: 0;
    left: 0;
    opacity: .5;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  #expansion {
    display: none;
    grid-area: 2 / 1 / 2 / 5;
    width: 100%;
    border: 1px dashed black;
  }

  .add-button {
    grid-column: 4;
    grid-row: 1;
    font-size: 24px;
    width: 25%;
  }

  @media screen and (max-width: 480px) {
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