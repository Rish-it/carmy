# Format money with `Intl`

**Need:** show a localized total.

**Reuse check:** locale-aware currency formatting is built in.

```js
const money = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
});
money.format(total);
```

Keep money as integer minor units or a decimal type in business logic; formatting
belongs at the display boundary. Test a known amount and target locale.
