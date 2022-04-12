export const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export const convertEditionForDie = die => {
    let newEdition = die.edition;
    if (die.edition === 'SFR Terrain' && die.rarity === 'Advanced Terrain') {
        const name = die.name.split(' ')[0];
        newEdition = `SFR ${name} 2010`;
    } else if (die.edition === 'SFR Eldarim' && die.type === 'Champion') {
        newEdition = 'No Edition'
    } else if (die.name.includes('Deadland') && die.edition === 'SFR Terrain') {
        newEdition = 'SFR Deadlands (minor)';
    }

    return newEdition;
};
export const mergeMyForces = (myForcesA, myForcesB) => {
    return myForcesA.map( myForceA => {
        return {...myForceA, ...myForcesB.filter(myForceB => myForceB.name === myForceA.name)[0]};
    });
}

export const resetSlots = (myForce) => {
    if (!myForce) {
        return null;
    }
    if (!myForce.slots) {
        myForce.slots = {};
    }

    if (!myForce.slots['Home']) {
        myForce.slots['Home'] = [];
    } else {
        myForce.slots['Home'] = myForce.slots['Home'].filter(die => die.amount > 0);
    }

    if (!myForce.slots['Horde']) {
        myForce.slots['Horde'] = [];
    } else {
        myForce.slots['Horde'] = myForce.slots['Horde'].filter(die => die.amount > 0);
    }

    if (!myForce.slots['Campaign']) {
        myForce.slots['Campaign'] = [];
    } else {
        myForce.slots['Campaign'] = myForce.slots['Campaign'].filter(die => die.amount > 0);
    }

    if (!myForce.slots['Summoning']) {
        myForce.slots['Summoning'] = [];
    } else {
        myForce.slots['Summoning'] = myForce.slots['Summoning'].filter(die => die.amount > 0);
    }

    if (!myForce.slots['Home Terrain']) {
        myForce.slots['Home Terrain'] = [];
    } else {
        myForce.slots['Home Terrain'] = myForce.slots['Home Terrain'].filter(die => die.amount > 0);
    }

    if (!myForce.slots['Frontier Terrain']) {
        myForce.slots['Frontier Terrain'] = [];
    } else {
        myForce.slots['Frontier Terrain'] = myForce.slots['Frontier Terrain'].filter(die => die.amount > 0);
    }

    return myForce;
}