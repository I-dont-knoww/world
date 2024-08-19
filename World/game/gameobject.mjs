import IDManager from '../utils/idmanager.mjs';

export default class GameObject {
    /**
     * @param {number} id
     */
    constructor(id) {
        this.id = id;

        this.remove = false;
    }

    update() {

    }

    delete() {
        IDManager.relinquishID(this.id);
        this.remove = true;
    }
}