# Platform-native solutions

Before adding a package or helper, check whether the language, browser,
framework, or database already owns the problem. Native is not automatically
better; it is the first rung to verify.

## HTML elements

| Need | Native option |
|---|---|
| Date, time, or color picker | `<input type="date">`, `time`, `color` |
| Slider | `<input type="range">` |
| Progress or gauge | `<progress>`, `<meter>` |
| Modal | `<dialog>` + `showModal()` |
| Disclosure or FAQ | `<details><summary>` |
| Searchable choices | `<datalist>` |
| Baseline form validation | `required`, `pattern`, semantic `type`, `:invalid` |

## CSS capabilities

| Need | Native option |
|---|---|
| Responsive type or spacing | `clamp()` |
| Dark mode | `prefers-color-scheme` |
| Reduced motion | `prefers-reduced-motion` |
| Responsive grid | `repeat(auto-fit, minmax(...))` |
| Component responsiveness | container queries |
| Theme tokens | custom properties |
| Sticky region | `position: sticky` |
| Scroll snapping | `scroll-snap-type` |
| Aspect ratio | `aspect-ratio` |
| Multi-line truncation | `line-clamp` |

## JavaScript and browser APIs

| Need | Native option |
|---|---|
| Query-string parser | `URLSearchParams` |
| Deep clone of cloneable data | `structuredClone()` |
| Grouping | `Object.groupBy()` or `Map` |
| Number/date formatting | `Intl.NumberFormat`, `Intl.DateTimeFormat` |
| UUID | `crypto.randomUUID()` |
| Infinite-scroll trigger | `IntersectionObserver` |
| Element resize signal | `ResizeObserver` |
| Clipboard write | `navigator.clipboard.writeText()` |
| Request timeout | `AbortSignal.timeout()` |
| Share sheet | `navigator.share()` |

Check browser targets before relying on newer APIs. A compatibility constraint is
an explicit reason to add a fallback or dependency.

## Swift and SwiftUI

| Need | Native option |
|---|---|
| Date/color picker | `DatePicker`, `ColorPicker` |
| Search/filter field | `.searchable(text:)` |
| Pull to refresh | `.refreshable {}` |
| Async image | `AsyncImage` |
| Loading indicator | `ProgressView()` |
| Share sheet | `ShareLink` |
| Basic charting | Swift Charts |
| JSON | `Codable`, `JSONDecoder` |
| HTTP | `URLSession` with async/await |
| Logging | `Logger` from `os` |
| IDs and base64 | `UUID()`, `Data.base64EncodedString()` |

## Node.js standard library

| Need | Native option |
|---|---|
| Recursive directory create | `fs.mkdir(..., { recursive: true })` |
| Remove a path | `fs.rm(..., { recursive: true, force: true })` |
| Path normalize | `path.normalize()` |
| UUID | `crypto.randomUUID()` |
| Read/write JSON | `fs.readFile` + `JSON.parse`; `fs.writeFile` |
| Deduplicate array | `[...new Set(values)]` |
| Flatten array | `Array.prototype.flat()` |
| File existence | `fs.existsSync()` when synchronous behavior is appropriate |

## Python standard library

| Need | Native option |
|---|---|
| ISO date parse | `datetime.fromisoformat()` |
| Time zones | `zoneinfo.ZoneInfo` |
| Data carrier | `@dataclass` |
| CLI with one command | `argparse` |
| JSON | `json` |
| Caching / partials | `functools` |
| Iteration helpers | `itertools`, `collections` |
| Deep copy | `copy.deepcopy()` |
| Paths | `pathlib.Path` |

## Database constraints and queries

| Need | Database option |
|---|---|
| Unique value | `UNIQUE` constraint |
| Relationship | `FOREIGN KEY` |
| Value range | `CHECK` constraint |
| Duplicate-safe insert | `ON CONFLICT` / equivalent |
| Pagination | `LIMIT` / `OFFSET` or keyset pagination |
| Rank or running total | window function |
| Tree walk | recursive CTE |
| Basic full-text search | database full-text index |
| Generated value | default, generated column, or trigger |

Application validation still matters for UX and trust boundaries. Database
constraints protect every caller, including scripts and concurrent writers.

## Pattern

1. Verify target-platform support and project browser/runtime policy.
2. Reuse native capability when it meets behavior, accessibility, security, and
   maintenance needs.
3. Add a dependency only when a named missing requirement remains.

Say the reason in one line when native is insufficient. That is enough.
