# Debounce without a dependency

**Need:** wait until typing pauses before searching.

**Reuse check:** browser timer APIs already provide cancellation and scheduling.

```js
const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
```

Create one debounced search function per input, then test that multiple calls
within `ms` produce one search using the project’s existing timer test pattern.
Add a library only for named requirements such as cancellable promises, leading
and trailing semantics, or shared scheduler integration.
