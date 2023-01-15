import {onDestroy, untilDestroyed} from "../dist/index.esm.js";

testSync();
testAsync();

function testSync() {
	let foo = [1, 2, 3, 4];
	onDestroy(foo, () => console.log("Array has been destroyed (1)"));
	onDestroy(foo, () => console.log("Array has been destroyed (2)"));
}

async function testAsync() {
	let foo = [1, 2, 3, 4];
	const lock = untilDestroyed(foo);
	foo = null;
	await lock;
	console.log("Destructor called (async)");
}
