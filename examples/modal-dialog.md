# Modal with semantic HTML

**Need:** confirmation dialog with focus behavior.

**Reuse check:** use `<dialog>` before building a focus trap and overlay system.

```html
<dialog id="confirm"><form method="dialog"><button value="cancel">Cancel</button><button value="confirm">Confirm</button></form></dialog>
```

```js
confirm.showModal();
```

Test open, cancel, confirm, and focus return using the project’s accessibility
test approach. Add a component only for named requirements missing from supported
browser targets.
