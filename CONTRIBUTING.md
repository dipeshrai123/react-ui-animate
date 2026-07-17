# Contributing

## Hook design conventions

New hooks should return a **plain object**, not a tuple — `{ x, y, controls }`,
not `[x, y, controls]`. This is what `useDrag`, `useScrollProgress`, and
`useInView`'s options object already do, and it scales better than a tuple
once a hook has more than two or three return values (named properties don't
require the caller to remember positional order, and adding a new field
later isn't a breaking change the way inserting into a tuple is).

`useValue`'s `[value, setValue, controls]` tuple and `useInView`'s bare
boolean return are grandfathered exceptions — they predate this convention
and are load-bearing across every example in this repo, so they aren't being
changed retroactively. Match the object convention for anything new.
