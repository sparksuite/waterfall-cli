# <div align="center">Waterfall CLI</div>

<p align="center">
    <a href="https://www.npmjs.com/package/waterfall-cli">
        <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/waterfall-cli">
    </a>
    <a href="https://app.codecov.io/gh/sparksuite/waterfall-cli/branch/master">
        <img alt="Codecov coverage" src="https://img.shields.io/codecov/c/github/sparksuite/waterfall-cli">
    </a>
    <a href="https://www.npmjs.com/package/waterfall-cli">
        <img alt="npm downloads" src="https://img.shields.io/npm/dw/waterfall-cli">
    </a>
    <a href="https://www.npmjs.com/package/waterfall-cli">
        <img alt="npm release" src="https://img.shields.io/npm/v/waterfall-cli">
    </a>
    <a href="https://github.com/sparksuite/rugged">
        <img alt="tested with Rugged" src="https://img.shields.io/badge/tested%20with-Rugged-green">
    </a>
    <a href="https://github.com/sparksuite/waterfall-cli/blob/master/LICENSE">
        <img alt="license" src="https://img.shields.io/npm/l/waterfall-cli">
    </a>
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
