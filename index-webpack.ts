#!/usr/bin/env node

import { Cli } from "./src/Cli";

console.debug = () => {};

new Cli().run().catch((error) => {
  console.error(`Error running`, error);
});
