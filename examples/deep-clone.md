# Clone data without a clone library

**Need:** copy API-shaped data before local edits.

**Reuse check:** for structured-cloneable values, browser and modern Node
runtimes already provide `structuredClone`.

```js
const editable = structuredClone(apiResponse);
```

Regression check: mutate a nested field in `editable`; assert original response
is unchanged. Do not use this for functions, DOM nodes, or class instances whose
semantics need a deliberate copy method.
