#!/usr/bin/env node

require("ts-node").register({
  projectSearchDir: __dirname,
});

const { Cli } = require("./src/Cli.ts");

new Cli().run().catch((error) => {
  console.error(`Error running`, error);
});
