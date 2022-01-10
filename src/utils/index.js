export const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

export const resetSlots = (myForce) => {
    if (!myForce.slots) {
        myForce.slots = {};
    }

    if (!myForce.slots['Home']) {
        myForce.slots['Home'] = [];
    }

    if (!myForce.slots['Horde']) {
        myForce.slots['Horde'] = [];
    }

    if (!myForce.slots['Campaign']) {
        myForce.slots['Campaign'] = [];
    }

    if (!myForce.slots['Summoning']) {
        myForce.slots['Summoning'] = [];
    }

    if (!myForce.slots['Home Terrain']) {
        myForce.slots['Home Terrain'] = [];
    }

    if (!myForce.slots['Frontier Terrain']) {
        myForce.slots['Frontier Terrain'] = [];
    }

    return myForce;
}