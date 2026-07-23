# Cold vs. hot

Same bug, same fix, same rigor — only the explanation changes. Switch with
`/carmy cold` / `/carmy hot` (or `:cold` / `:hot`).

**Bug:** a search box fires an API call on every keystroke.

## cold (default)

> Input handler calls `fetch` per keystroke — no debounce. Wrap the call in a
> `setTimeout`/`clearTimeout` pair (stdlib, rung 3); no debounce library.

```js
let t;
search.addEventListener('input', (e) => {
  clearTimeout(t);
  t = setTimeout(() => fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`), 300);
});
```

## hot (same fix, beginner-friendly)

> Right now the search box is like a coworker who forwards you every single
> keystroke as a separate email — "s", "se", "sea"… ten emails to type "seattle".
> Debounce is telling them: *wait until I stop typing for 300ms, then send one.*
> We do it with the two timers the language already ships — start a countdown on
> each keystroke, cancel the previous one, only the last survivor fires:

```js
let t;
search.addEventListener('input', (e) => {
  clearTimeout(t);            // cancel the pending countdown
  t = setTimeout(() => fetch(`/api/search?q=${encodeURIComponent(e.target.value)}`), 300);
});
```

Note the code is **identical**. Hot spends its extra words on the analogy, never
on a weaker solution — no debounce library, no wrapper class, same tight diff.
