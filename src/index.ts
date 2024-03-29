interface Destructor {
	(): void;
}

interface ErrorHandler {
	(error: unknown): void;
}

// Two maps are needed: `destructor` for detecting a garbage collection,
// and `watching` for appending new destructors to an already-watched object
// to avoid checking the same object for destruction multiple times.

const destructors = new Map<WeakRef<object>, Destructor[]>();
const watching = new WeakMap<object, Destructor[]>();

let detectionIntervalHandle: ReturnType<typeof setInterval> | undefined = undefined;
let detectionInterval = 500;
let errorHandler: ErrorHandler = error => console.log("Exception during destructor call:", error);

/**
 * @param obj The object to watch for destruction.
 * @param destructor A function that is called if the object is garbage-collected.
 */
export function onDestroy<T extends object>(obj: T, destructor: Destructor): T {
	if (typeof obj !== "object") {
		throw new TypeError(`Argument is not an object (${typeof obj}).`);
	}

	const ref = new WeakRef(obj);
	if (watching.has(obj)) {
		watching.get(obj)!.push(destructor);
	} else {
		const destructorList = [destructor];
		destructors.set(ref, destructorList);
		watching.set(obj, destructorList);
	}

	if (detectionIntervalHandle === undefined) {
		detectionIntervalHandle = setInterval(detectGC, detectionInterval);
	}

	return obj;
}

/**
 * Creates a promise that will resolve once the passed object has been garbage-collected.
 * @param obj The object to watch for destruction.
 */
export function untilDestroyed(obj: object): Promise<void> {
	return new Promise(resolve => onDestroy(obj, resolve));
}

/**
 * Changes the garbage collection detection interval. Default is 500ms.
 * @param interval
 */
export function setDetectionInterval(interval: number) {
	if (detectionInterval === interval) return;

	detectionInterval = interval;
	if (detectionIntervalHandle !== undefined) {
		clearInterval(detectionIntervalHandle);
		detectionIntervalHandle = setInterval(detectGC, detectionInterval);
	}
}

export function setErrorHandler(handler: ErrorHandler) {
	errorHandler = handler;
}

/**
 * Iterates over all weak references. If it cannot be dereferenced,
 * then it has been garbage-collected and the destructors are called.
 */
function detectGC() {
	destructors.forEach((destructorList, ref) => {
		if (ref.deref()) return;
		// Garbage collected
		destructors.delete(ref);
		for (const destructor of destructorList) {
			try {
				destructor();
			} catch (e) {
				errorHandler(e);
			}
		}
	});

	if (destructors.size < 1) {
		clearInterval(detectionIntervalHandle);
		detectionIntervalHandle = undefined;
	}
}
