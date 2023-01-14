# Object Destructor

## Usage

The module exports the function `addDestructor`. It takes
a function which creates an object and a function that should be
called some time after the object's creation. When exactly it is
called cannot be relied on, because it depends on the browser's
implementation of the garbage collection.

```js
window.objs = {
    test: addDestructor(
        () => [1, 2, 3, 4],
        () => console.log("test has been destroyed.")
    ),
};
objs.test.push(5);
delete objs.test;
// `test` is going to be garbage collected.
```

At the moment, it is checked every 500ms whether an object has been
garbage-collected. you can configure this interval using the exported
function `setDetectionInterval` which takes the millisecond interval
as its only argument.

## Danger Zone

In the previous example, the garbage collection might be called.
When using Firefox, this is going to happen on the next
"Cycle Collection" in this specific case. Cycle collections are
very rare, and **you should never depend on a garbage collection
in your code**!

Also note that you cannot use a reference to the object in the
destructor, because then the destructor is keeping the object
alive and is never going to be called. A reference also cannot
exist in the same scope that the destructor is inside. That's
why `addDestructor` takes a function that creates the object
instead of the object itself. This reduces the risk of accidentally
storing an object reference in the destructor's scope:

```js
// THIS CODE MIGHT NOT WORK
{
    let test = [1, 2, 3, 4];
    window.objs = {
        test: addDestructor(
            () => test,
            () => console.log("test has been destroyed")
        ),
    };
}
delete objs.test;
// `test` is probably never going to be garbage collected.
```

Why might the above code not work? That's because JavaScript has the
legacy function `eval` and you can get any variable in scope by calling
`eval("test")`. This is dynamic. Depending on how optimized the
JavaScript runtime is, it might bind `test` to the destructor closure
just to be safe.

Another thing to keep in mind is that your browser's developer tools
might prevent objects from being garbage-collected if you, for example,
log the object to the console or even have it give you the object as
a suggestion.

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
supports `WealRef`. All major browsers support it, including Node.

See <https://caniuse.com/mdn-javascript_builtins_weakref>:

| Node  | IE  | Edge | Firefox | Chrome | Safari | Opera | iOS Safari | Opera Mini | Android Browser | Opera Mobile | Chrome for Android | Firefox for Android |
|-------|-----|------|---------|--------|--------|-------|------------|------------|-----------------|--------------|--------------------|---------------------|
| 14.6+ | X   | 84+  | 79+     | 84+    | 14.1+  | 70+   | 14.5+      | X          | 108+            | 72+          | 108+               | 107+                |

[weakref]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
