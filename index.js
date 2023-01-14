/**
 * @typedef {{
 * 	 deref: () => T|undefined;
 * }} WeakRef<T>
 * @template T
 */
/**
 * @typedef {{
 *   new(obj: T) => WeakRef<T>;
 * }} WeakRefConstructor<T>
 * @template T
 */

/**
 * @type {Map<WeakRef<Object>, () => void>}
 */
const destructors = new Map();

let destructionInterval = undefined;

/**
 * @param {() => T} objCreator A function that creates an object.
 * @param {() => void} objDestructor A function that is called if the object is garbage collected.
 * @returns {T}
 * @template T
 */
function addDestructor(objCreator, objDestructor) {
	const sym = Symbol("destructor");
	{
		const obj = objCreator();
		if (typeof obj !== "object")
			throw new TypeError("The created object is not an object.");
		const desObj = Object.freeze({ destructor: sym });
		destructors.set(new WeakRef(desObj), objDestructor);
		Object.defineProperty(obj, sym, { value: desObj, writable: false });

		if (destructionInterval === undefined) {
			destructionInterval = setInterval(() => {
				destructors.forEach((des, ref) => {
					if (ref.deref()) return;
					// Garbage collected
					destructors.delete(ref);
					des();
				});

				if (destructors.size < 1) {
					clearInterval(destructionInterval);
					destructionInterval = undefined;
				}
			}, 500);
		}

		return obj;
	}
}

if (typeof process === 'object' && typeof require === 'function') {
	module.exports = {
		addDestructor,
	};
}
