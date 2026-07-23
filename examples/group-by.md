# Group without a utility package

**Need:** render records grouped by status.

**Reuse check:** use `Object.groupBy` on supported runtimes; use `Map` when keys
are not strings or browser policy needs a wider fallback.

```js
const byStatus = Object.groupBy(records, ({ status }) => status);
```

Test empty input, one status, and multiple statuses. The shared grouping step is
the root; do not duplicate a filter loop in each rendered section.
