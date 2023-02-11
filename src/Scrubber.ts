import { spawn } from "child_process";

export class Scrubber {
  public async scrub(filesystem: string) {
    const command = "btrfs";
    const args = [
      "scrub",
      "start",
      "-B",
      "-d",
      "-c",
      "2",
      "-n",
      "7",
      filesystem,
    ];
    console.info(`Scrubbing ${filesystem}: ${args.join(" ")}`);

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
          console.info(`Done scrubbing ${filesystem}`);
          resolve();
        } else {
          console.error(`Error scrubbing ${filesystem}: ${code}`);
          reject(`Error scrubbing ${filesystem}: ${code}`);
        }
      });
    });
  }
}
