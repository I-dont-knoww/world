let currentID = 0;
const IDPool = [];

export default {
    /**
     * @returns {number}
     */
    assignID() {
        if (IDPool.length == 0) return currentID++;
        return IDPool.shift();
    },

    /**
     * @param {number} id
     */
    relinquishID(id) {
        IDPool.push(id);
    }
};