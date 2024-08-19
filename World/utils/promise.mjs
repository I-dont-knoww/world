export function resolveTo(promise, value) {
    return new Promise(resolve => promise.then(() => resolve(value)));
}

export function awaitEvent(eventName, target=window, output=undefined) {
    return new Promise(resolve => {
        const eventHandler = event => {
            target.removeEventListener(eventName, eventHandler);
            resolve(output ?? event);
        }
    
        target.addEventListener(eventName, eventHandler);
    });
}