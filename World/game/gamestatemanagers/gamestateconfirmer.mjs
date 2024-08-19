import TypeManager from '../../utils/typemanager.mjs';

/**
 * @param {*[]} gameObjects1
 * @param {*[]} gameObjects2
 * @returns {boolean}
 */
export default function gameStateEquals(gameState1, gameState2) {
    if (gameState1.length != gameState2.length) return false;

    for (let i = 0; i < gameState1.length; i++) if (!gameStateObjectEquals(gameState1[i], gameState2[i]))
        return false;

    return true;
}

/**
 * @param {*} object1
 * @param {*} object2
 * @returns {boolean}
 */
function gameStateObjectEquals(object1, object2) {
    if (object1.constructor != object2.constructor) return false;

    const type = TypeManager.getTypeOf(object1.constructor.name);
    return gameStateObjectTypeEquals(object1, object2, type);
}

/**
 * @param {*} object1
 * @param {*} object2
 * @param {number} [maybeType]
 * @returns {boolean}
 */
function gameStateObjectTypeEquals(object1, object2, maybeType) {
    const type = maybeType ?? TypeManager.getTypeOf(object1.constructor.name);

    switch (type) {
        case TypeManager.getTypeOf('Vec2'): case TypeManager.getTypeOf('BigVec2'): {
            const closeEnough = (a, b) => Math.abs(a - b) < 2;

            return closeEnough(object1.x, object2.x) && closeEnough(object1.y, object2.y);
        }
        case TypeManager.getTypeOf('GameObject'): {
            return object1.id == object2.id;
        }
        case TypeManager.getTypeOf('PhysicsObject'): {
            const posEquals = gameStateObjectTypeEquals(object1.pos, object2.pos);
            const velEquals = gameStateObjectTypeEquals(object1.vel, object2.vel);
            const idEquals = gameStateObjectTypeEquals(object1, object2, TypeManager.getTypeOf('GameObject'));

            return posEquals && velEquals && idEquals;
        }
        case TypeManager.getTypeOf('PlayerObject'): {
            const physicsEquals = gameStateObjectTypeEquals(object1, object2, TypeManager.getTypeOf('PhysicsObject'));
            const socketEquals = object1.socketKey == object2.socketKey;

            return physicsEquals && socketEquals;
        }
    }
}