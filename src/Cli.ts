import { Scheduler } from "./Scheduler";
import { promises as fs } from "fs";
import { Scrubber } from "./Scrubber";
import { Configuration } from "./Configuration";

const CONFIG_FILENAME = "config.json";
const LASTRUN_FILENAME = "lastrun.json";

export class Cli {
  async run() {
    let configuration;
    try {
      configuration = JSON.parse(await fs.readFile(CONFIG_FILENAME, "utf-8"));
    } catch (error) {
      console.error(`Error reading configuration file: ${error}`);
      const exampleConfiguration: Configuration = {
        period: 30,
        filesystems: ["/mnt/filesystem-1", "/mnt/filesystem-2"],
      };
      console.info(`Configuration file should look like this:`);
      console.info(JSON.stringify(exampleConfiguration, null, 2));
      throw new Error(`Error reading configuration file: ${error}`, {
        cause: error,
      });
    }
    let lastRun = {};
    try {
      lastRun = JSON.parse(await fs.readFile(LASTRUN_FILENAME, "utf-8"));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw new Error(`Error reading ${LASTRUN_FILENAME}: ${error}`, {
          cause: error,
        });
      }
    }
    const scrubber = new Scrubber();
    const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
    await scheduler.run();
    await fs.writeFile("lastrun.json", JSON.stringify(lastRun, null, 2));
  }
}
