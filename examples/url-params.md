# Parse URL parameters natively

**Need:** read and update `page` and `filter`.

**Reuse check:** `URL` and `URLSearchParams` preserve encoding rules.

```js
const url = new URL(location.href);
const page = Number(url.searchParams.get('page') ?? 1);
url.searchParams.set('filter', filter);
history.replaceState(null, '', url);
```

Validate numeric range before use. Test absent, repeated, encoded, and malformed
parameters according to product behavior; do not hand-split query strings.
