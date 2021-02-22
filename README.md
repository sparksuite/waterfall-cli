# Waterfall CLI

Effortlessly create powerful, thoughtfully-organized CLIs with Node.js, using an intuitive cascading design.

_**Heads up!** This proof-of-concept is only used internally right now; however, we may flesh out Waterfall CLI as a fully-capable open source project in the future._

### Notes for future documentation:

The `printError()` function prints a message in a standardized way. The message will be sent to `stderr`, and it is possible that this might appear *before* un-flushed content in the `stdout` stream has been flushed. So, care may be needed to ensure `stdout` is flushed before calling `printError()` if you want the error message to always appear last. Also, it's your responsibility what happens after the message is output. ie: If you want to exit the program, and you're not within asynchronously executed code, you might be fine using `process.exit()` to immediately exit. But, if within asynchronous or callback code, you will likely find that `process.exit()` does not immediately exit, but instead, the 'exit' is scheduled for execution *after* currently executing code is done, so you'll need to use other flow control approaches (eg: `return` or throw an `Error`) to prevent subsequent code from executing.
