# Infinite scroll with an observer

**Need:** load another page when a sentinel reaches the viewport.

**Reuse check:** `IntersectionObserver` reports that boundary without scroll
event math.

```js
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) loadNextPage();
});
observer.observe(sentinel);
```

Guard `loadNextPage` against concurrent requests and disconnect during teardown.
Test shared loading state, not only one component’s scroll handler.
