# Waterfall CLI

Effortlessly create powerful, thoughtfully-organized CLIs with Node.js, using an intuitive cascading design.

_**Heads up!** This proof-of-concept is only used internally right now; however, we may flesh out Waterfall CLI as a fully-capable open source project in the future._

Notes:

The `error()` function, if used in an async context like `await waterfall.error('Message text goes here');`, will attempt to wait for buffered stdout content to flush _before_ emitting the error message on stderr and terminating the application. Using the `error()` function in a synchronous context, though, will likely not see this happen because the code won't wait for the `Promise` to resolve.
