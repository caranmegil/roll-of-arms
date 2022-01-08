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

    if (!myForce.slots['Frontier']) {
        myForce.slots['Frontier'] = [];
    }

    if (!myForce.slots['Summoning']) {
        myForce.slots['Summoning'] = [];
    }
}