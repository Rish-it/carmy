# Rate limits belong at the shared boundary

**Need:** stop repeated expensive requests.

**Root cause:** per-handler counters protect one route while sibling routes and
workers still reach the same dependency.

**Reuse check:** inspect existing gateway, reverse proxy, framework, or shared
store limits first. Put the rule at the narrowest shared boundary covering every
caller. Reuse database or cache only when the project already owns one and its
consistency model meets the requirement.

Regression behavior: requests within quota pass; next request receives the
documented response; another route using the same protected dependency follows
the same rule. Do not add an in-memory limiter that breaks across processes.
