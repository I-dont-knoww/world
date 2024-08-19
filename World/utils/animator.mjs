export default {
    animations: [],
    initiate() {
        this.EASEIN_QUAD = this.EASEIN_POLYNOMIAL_FUNCTION(2);
        this.EASEOUT_QUAD = this.EASEOUT_POLYNOMIAL_FUNCTION(2);
        this.EASEINOUT_QUAD = this.EASEINOUT_POLYNOMIAL_FUNCTION(2);

        this.EASEIN_CUBIC = this.EASEIN_POLYNOMIAL_FUNCTION(3);
        this.EASEOUT_CUBIC = this.EASEOUT_POLYNOMIAL_FUNCTION(3);
        this.EASEINOUT_CUBIC = this.EASEINOUT_POLYNOMIAL_FUNCTION(3);

        this.EASEIN_QUART = this.EASEIN_POLYNOMIAL_FUNCTION(4);
        this.EASEOUT_QUART = this.EASEOUT_POLYNOMIAL_FUNCTION(4);
        this.EASEINOUT_QUART = this.EASEINOUT_POLYNOMIAL_FUNCTION(4);

        this.EASEIN_QUINT = this.EASEIN_POLYNOMIAL_FUNCTION(5);
        this.EASEOUT_QUINT = this.EASEOUT_POLYNOMIAL_FUNCTION(5);
        this.EASEINOUT_QUINT = this.EASEINOUT_POLYNOMIAL_FUNCTION(5);
    },
    update(dt) {
        for (let i = 0; i < this.animations.length; i++) this.animations[i].update(dt);
        for (let i = this.animations.length - 1; i >= 0; i--) if (this.animations[i].done) {
            const temp = this.animations[i];
            this.animations[i] = this.animations.at(-1);
            this.animations[this.animations.length - 1] = temp;
            this.animations.pop();
        }
    },
    createNewAnimation(start, end, length, easing, set) {
        const animation = new Animation(start, end, length, easing, set);
        this.animations.push(animation);
        return animation;
    },

    // https://easings.net/
    LINEAR: x => x,

    EASEIN_SINE: x => 1 - Math.cos((x * Math.PI) / 2),
    EASEOUT_SINE: x => Math.sin((x * Math.PI) / 2),
    EASEINOUT_SINE: x => -(Math.cos(Math.PI * x) - 1) / 2,

    EASEIN_POLYNOMIAL: a => x => x ** a,
    EASEOUT_POLYNOMIAL: a => x => 1 - (1 - x) ** a,
    EASEINOUT_POLYNOMIAL: a => x => (x < 0.5) ? (2 ** (a - 1) * x ** a) : (1 - ((-1) ** a) * ((2 * x - 2) ** a)/2),

    EASEIN_EXPO: x => x === 0 ? 0 : 2 ** (10 * x - 10),
    EASEOUT_EXPO: x => x === 1 ? 1 : 1 - 2 ** (-10 * x),
    EASEINOUT_EXPO: x => x === 0
        ? 0
        : x === 1
        ? 1
        : x < 0.5 ? (2 ** (20 * x - 10)) / 2
        : (2 - 2 ** (-20 * x + 10)) / 2,
    
    EASEIN_CIRC: x => 1 - (1 - x ** 2) ** 0.5,
    EASEOUT_CIRC: x => (1 - (x - 1) ** 2) ** 0.5,
    EASEINOUT_CIRC: x => x < 0.5
        ? (1 - (1 - (2 * x) ** 2) ** 0.5) / 2
        : ((1 - (-2 * x + 2) ** 2) ** 0.5 + 1) / 2,
    
    EASEIN_BACK: x => {
        const c1 = 1.70158;
        const c3 = c1 + 1;

        return c3 * x ** 3 - c1 * x ** 2;
    },
    EASEOUT_BACK: x => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        
        return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
    },
    EASEINOUT_BACK: x => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;

        return x < 0.5
            ? ((2 * x) ** 2 * ((c2 + 1) * 2 * x - c2)) / 2
            : ((2 * x - 2) ** 2 * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }
}

class Animation {
    static CANCELLED = 0;
    static FINISHED = 1;

    constructor(start, end, length, easing, set) {
        this.start = start;
        this.end = end;
        this.position = start;
        
        this.time = 0;
        this.length = length;

        this.easing = easing;
        this.set = set;

        const promiseAndResolvers = Promise.withResolvers();
        this.finish = promiseAndResolvers.promise;
        this.resolve = promiseAndResolvers.resolve;
        this.done = false;
    }

    update(dt) {
        if (this.done) return this.position;

        this.time += dt;
        if (this.time > this.end) {
            this.position = end;
            this.set(this.position);

            this.done = true;
            this.resolve(Animation.FINISHED);

            return this.position;
        }

        const percentDone = this.time/this.length;
        this.position = this.easing(percentDone) * (this.start + percentDone * (this.end - this.start));

        this.set(this.position);
        return this.position;
    }

    cancel() {
        this.done = true;
        this.resolve(Animation.CANCELLED);
    }
}