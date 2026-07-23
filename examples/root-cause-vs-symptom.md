# Root cause vs. symptom

**Report:** "The dashboard crashes when a user has no `lastLogin`."

## The symptom fix (what carmy rejects)

```js
// dashboard.js
if (user.lastLogin) {
  render(formatDate(user.lastLogin));
}
```

Smallest diff that makes *this* screen stop crashing — and wrong. `formatDate`
has other callers (settings, the audit log, the CSV export). Each still crashes
on a null date. The ticket named one symptom; the bug is in the shared function.

## The root-cause fix (what carmy does)

Rung 2 of the ladder — grep every caller before editing:

```
$ grep -rn "formatDate(" src/
src/dashboard.js:42:  render(formatDate(user.lastLogin));
src/settings.js:88:   show(formatDate(account.created));
src/audit.js:15:      row(formatDate(entry.at));
```

Three callers, one broken function. Fix it once, where they all route through:

```js
// format.js
function formatDate(value) {
  if (!value) return '—';        // null/undefined date renders as an em dash
  return new Intl.DateTimeFormat().format(new Date(value));
}
```

`Intl.DateTimeFormat` is rung 4 (native platform) — no date library added.

## Gates that applied

- **Branch:** `fix/null-date-format` off `main`.
- **TDD:** RED test `formatDate(null)` returns `'—'`; then the guard makes it GREEN.
- **Task-only diff:** only `format.js` and its test — no reformatting of the callers.
- **Verify twice:** test suite run twice, both green, before the commit.
- **PR:** root cause (shared `formatDate`, three callers), minimal fix, both runs.
