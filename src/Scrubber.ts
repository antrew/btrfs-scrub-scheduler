import { exec, spawn } from "child_process";

const scrubOptions = ["-B", "-d", "-c", "2", "-n", "7"];

export class Scrubber {
  public async scrub(filesystem: string) {
    const command = "btrfs";
    const args = ["scrub", "start", ...scrubOptions, filesystem];
    console.info(`Scrubbing ${filesystem}: ${args.join(" ")}`);
    await runAndLog(command, args);
    console.info(`Done scrubbing ${filesystem}`);
  }

  async resume(filesystem: string) {
    const command = "btrfs";
    const args = ["scrub", "resume", ...scrubOptions, filesystem];
    console.info(`Resuming scrub of ${filesystem}: ${args.join(" ")}`);
    await runAndLog(command, args);
    console.info(`Done scrubbing ${filesystem}`);
  }

  async cancel(filesystem: string) {
    const result = await run(`btrfs scrub cancel ${filesystem}`);
    console.info(result);
  }

  async status(filesystem: string) {
    const command = `btrfs scrub status ${filesystem}`;
    const result = await run(command);
    const aborted = result.includes("was aborted");
    return {
      aborted,
    };
  }
}

async function runAndLog(command, args) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {});
    child.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Error: ${code}`));
      }
    });
  });
}

function run(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (stderr) {
        console.error(stderr);
      }
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}
