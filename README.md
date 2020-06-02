# Waterfall CLI

Effortlessly create powerful, thoughtfully-organized CLIs with Node.js, using an intuitive cascading design.

_**Heads up!** This proof-of-concept is only used internally right now; however, we may flesh out Waterfall CLI as a fully-capable open source project in the future._

Notes:

The `error()` function, if used from an async context as `await waterfall.error('Message text goes here');`, an attempt is made to wait for buffered stdout content _before_ emitting the error message on stderr, and calling `exit()` to terminate the application.  Use in synchronous contexts will likely not see this happen because Promise resolution will not actually be waited for.
