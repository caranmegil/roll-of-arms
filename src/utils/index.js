export const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export const convertEditionForDie = die => {
    let newEdition = die.edition;
    if (die.edition === 'SFR Terrain' && die.rarity === 'Advanced Terrain') {
        newEdition = 'SFR Advanced Terrain Gold Ink';
    } else if (die.name.includes('Deadland')) {
        newEdition = 'SFR Deadlands Green Ink';
    }

    return newEdition;
};