const e=new Map;let t,r=500;function n(n,o){const a=n();if("object"!=typeof a)throw new TypeError("Creator did not return an object.");return e.set(new WeakRef(a),o),void 0===t&&(t=setInterval(c,r)),a}function o(e){r!==e&&(r=e,void 0!==t&&(clearInterval(t),setInterval(c,r)))}function c(){e.forEach(((t,r)=>{if(!r.deref()){e.delete(r);try{t()}catch(e){console.error("Exception during destructor call:",e)}}})),e.size<1&&(clearInterval(t),t=void 0)}export{n as addDestructor,o as setDetectionInterval};
//# sourceMappingURL=index.esm.js.map
