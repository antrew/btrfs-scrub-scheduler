import { Scheduler } from "./Scheduler";
import { promises as fs } from "fs";
import { Scrubber } from "./Scrubber";
import { Configuration } from "./Configuration";

const PROGRAM_NAME = "btrfs-scrub-scheduler";
const CONFIG_FILENAME = `/etc/${PROGRAM_NAME}/config.json`;
const LASTRUN_DIRECTORY = `/var/lib/${PROGRAM_NAME}`;
const LASTRUN_FILENAME = `${LASTRUN_DIRECTORY}/lastrun.json`;

export class Cli {
  async run() {
    const configuration = await this.loadConfiguration();
    console.debug("Configuration", configuration);
    const lastRun = await this.loadLastRun();
    const scrubber = new Scrubber();
    const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
    await scheduler.run();
    await this.saveLastRun(lastRun);
  }

  private async loadConfiguration() {
    let configuration;
    try {
      configuration = JSON.parse(await fs.readFile(CONFIG_FILENAME, "utf-8"));
    } catch (error) {
      console.error(`Error reading configuration file: ${error}`);
      const exampleConfiguration: Configuration = {
        period: 30,
        maxDuration: "PT7H",
        filesystems: ["/mnt/filesystem-1", "/mnt/filesystem-2"],
      };
      console.info(`Configuration file should look like this:`);
      console.info(JSON.stringify(exampleConfiguration, null, 2));
      throw new Error(`Error reading configuration file: ${error}`, {
        cause: error,
      });
    }
    return configuration;
  }

  private async loadLastRun() {
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
    return lastRun;
  }

  private async saveLastRun(lastRun) {
    await fs.mkdir(LASTRUN_DIRECTORY, { recursive: true });
    await fs.writeFile(LASTRUN_FILENAME, JSON.stringify(lastRun, null, 2));
  }
}
