export const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export const mergeMyForces = (myForcesA, myForcesB) => {
    return myForcesA.map( myForceA => {
        // let myForceAP = resetSlots(myForceA);
        return {...myForceA, ...myForcesB.filter(myForceB => myForceB.name === myForceA.name)[0]};

        // });
        // Object.keys(myForceAP.slots).forEach(slotName => {
        //     myForceAPCopy.slots[slotName] = [myForceAP.slots[slotName], myForcesB.filter(myForceB => myForceAP.name === slot)]
        // })
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