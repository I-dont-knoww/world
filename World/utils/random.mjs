// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// SplitMix32

export default class Random {
    /**
     * @param {number} seed
     */
    constructor(seed) {
        this.seed = seed;
    }

    /**
     * @returns {number}
     */
    random() {
        this.seed |= 0;
        this.seed = this.seed + 0x9e3779b9 | 0;

        let t = this.seed ^ this.seed >>> 16;
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ t >>> 15;
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }

    /**
     * @param {number} a
     * @param {number} [b]
     * @returns {number}
     */
    randrange(a, b) {
        const end = b;
        const start = a;
        
        if (!end) return this.random() * start;
        return this.random() * (end - start) + start;
    }

    /**
     * @param {number} a
     * @param {number} [b]
     * @returns {number}
     */
    randint(a, b) {
        return this.randrange(a, b) >>> 0;
    }

    /**
     * @param {*[]} array
     * @returns {*}
     */
    choice(array) {
        return array[this.randint(0, array.length)];
    }

    // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    /**
     * @param {*[]} array
     * @returns {*[]}
     */
    shuffleInPlace(array) {
        let curIndex = array.length;

        while (curIndex != 0) {
            let randomIndex = (this.random() * curIndex) >>> 0;
            curIndex--;

            const temp = array[randomIndex];
            array[randomIndex] = array[curIndex];
            array[curIndex] = temp;
        }
    }

    /**
     * @param {*[]} array
     * @returns {*[]}
     */
    shuffle(unshuffled) {
        const shuffled = unshuffled.slice(0);
        return this.shuffleInPlace(shuffled);
    }
}

export const getSeed = () => (Math.random() * 2 ** 32) >>> 0;