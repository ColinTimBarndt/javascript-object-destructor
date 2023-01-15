# Object Destructor

## Usage

The module exports the function `onDestroy`. It takes an object
to watch and a function that should be called some time after the
object's destruction. When exactly it is called cannot be relied on,
because it depends on the browser's implementation of the garbage
collection.

```js
doStuff();
function doStuff() {
    let myArray = [1, 2, 3, 4];
    onDestroy(myArray, () => console.log("Destroyed"));
    // myArray is out of scope and will be garbage-collected
}
```

There is also an asynchronous version available:

```js
doStuff();
async function doStuff() {
    let myArray = [1, 2, 3, 4];
    let lock = untilDestroyed(myArray);
    myArray = null;
    await lock;
    console.log("Destroyed");
}
```

At the moment, it is checked every 500ms whether an object has been
garbage-collected. You can configure this interval using the exported
function `setDetectionInterval` which takes the millisecond interval
as its only argument.

Before using this module, please read through the danger zone to
understand the quirks of a garbage collector in different browsers!

## Danger Zone

In the previous example, the garbage collection might be called.
This can happen at any time, and **you should never depend on a
garbage collection in your code**! Depending on the implementation,
the browser could also decide not to run a garbage-collection until
too much memory is used to save on performance.

Also note that you cannot use a reference to the object in the
destructor, because then the destructor is keeping the object
alive and is never going to be called:

```js
// !! MIGHT NOT WORK !!
doStuff();
function doStuff() {
    let myArray = [1, 2, 3, 4];
    onDestroy(myArray, () => console.log("Destroyed", myArray));
    // myArray is kept alive by the destructor
}
```

Another example:

```js
// !! MIGHT NOT WORK !!
let foo = [1, 2, 3, 4];
bar();
foo = [];

function bar() {
	onDestroy([1, 2, 3, 4], () => console.log("Array has been destroyed (1)."));
	onDestroy(foo, () => console.log("Array has been destroyed (2)."));
}
```

Here, only the first destructor will ever be called in Firefox 108. It has
probably something to do with the function scope keeping the original
array alive for some reason. Chromium browsers will destroy both arrays.
This behavior is best avoided by not adding watched objects to a global
scope. **Creating an object in a function, attaching the destructor, and
then returning it is the safest way that I could find**.

Never use `eval` because it *could* access any variable in scope dynamically
which means that the browser needs to keep everything in scope alive.

Another thing to keep in mind is that your browser's developer tools
might prevent objects from being garbage-collected if you, for example,
log the object to the console or even have it give you the object as
a suggestion.

I tested this module with Firefox 108 and Chromium 109. If you find
any problems then please don't hesitate to file an issue.

## Why?

You should never have to use this module in your everyday code. That
said, it might be interesting for use with WebAssembly and smart
pointers. For example: You want to expose a WASM function that returns
a smart pointer to a structure. The structure itself is stored in the
WASM heap memory. Now, if you don't want the structure to permanently
occupy the memory, and be destroyed if it is not used anymore, it is
very easy on the native (WASM) side, because smart pointers are
already implemented there. They work by counting the references to
the wrapped structure, and free the memory if the last pointer is
dropped. On the JavaScript side, however, there is no "reference
counting" and you don't want to free memory in WASM if the object
could still be used by JavaScript. In this case, you need to know
when all references to the structure have also been dropped on the
JavaScript side. That's what this module was made for.

## Browser Compatibility

This module's functionality depends on whether the target platform
supports [WeakRef]. All major browsers support it, including Node.

See <https://caniuse.com/mdn-javascript_builtins_weakref>:

| Node  | IE  | Edge | Firefox | Chrome | Safari | Opera | iOS Safari | Opera Mini | Android Browser | Opera Mobile | Chrome for Android | Firefox for Android |
|-------|-----|------|---------|--------|--------|-------|------------|------------|-----------------|--------------|--------------------|---------------------|
| 14.6+ | X   | 84+  | 79+     | 84+    | 14.1+  | 70+   | 14.5+      | X          | 108+            | 72+          | 108+               | 107+                |

[WeakRef]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
