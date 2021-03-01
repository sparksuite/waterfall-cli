# <div align="center">Waterfall CLI</div>

<p align="center">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/waterfall-cli">
<img alt="Codecov" src="https://img.shields.io/codecov/c/github/sparksuite/waterfall-cli">
<img alt="npm" src="https://img.shields.io/npm/dw/waterfall-cli">
<img alt="npm" src="https://img.shields.io/npm/v/waterfall-cli">
<img alt="npm" src="https://img.shields.io/npm/l/waterfall-cli">
</p>

TODO

## Quick start

TODO

## Documentation

Read the docs at: https://waterfallcli.io/docs/

## Contributing

We love contributions! Contributing is easy; [learn how](https://github.com/sparksuite/waterfall-cli/blob/master/CONTRIBUTING.md).

### Notes for future documentation:

The `printError()` function prints a message in a standardized way. The message will be sent to `stderr`, and it is possible that this might appear *before* un-flushed content in the `stdout` stream has been flushed. So, care may be needed to ensure `stdout` is flushed before calling `printError()` if you want the error message to always appear last. Also, it's your responsibility what happens after the message is output. ie: If you want to exit the program, and you're not within asynchronously executed code, you might be fine using `process.exit()` to immediately exit. But, if within asynchronous or callback code, you will likely find that `process.exit()` does not immediately exit, but instead, the 'exit' is scheduled for execution *after* currently executing code is done, so you'll need to use other flow control approaches (eg: `return` or throw an `Error`) to prevent subsequent code from executing.
