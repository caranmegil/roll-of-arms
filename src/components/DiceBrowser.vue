<template>
    <div class="dice-browser">
        <div class="element">
            <label for="speciesFilter">Species</label>
            <select id="speciesFilter" @change="setSpeciesFilter">
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
            <select id="editionFilter">
            </select>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DiceBrowser',
    data() {
        return {
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
    mounted() {
        console.log('test')
    },
    methods: {
        setSpeciesFilter: function() {
            console.log('flag 0')
            const speciesFilter = document.getElementById('speciesFilter').value;
            console.log(speciesFilter);
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
  }

  .dice-browser .element > label {
    font-weight: bold;
    justify-self: start;
    align-self: start;
  }

  .dice-browser select {
    border-radius: .25em;
  }
</style>