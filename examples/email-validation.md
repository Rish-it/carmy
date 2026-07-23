# Email validation is not a giant regex

**Need:** catch obvious form mistakes and ensure account ownership.

**Reuse check:** native input validation handles format-level feedback.

```html
<input name="email" type="email" required autocomplete="email">
```

Server accepts a normalized value, rate-limits confirmation requests, and proves
ownership with a confirmation link. A stricter client regex does not establish
deliverability or ownership; add one only for a documented product rule.
