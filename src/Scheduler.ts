import { Configuration } from "./Configuration";
import { Scrubber } from "./Scrubber";
import { LastRun } from "./LastRun";
import moment, { Duration } from "moment";

interface SchedulerProps {
  period: number;
  maxDuration?: string;
  filesystems: string[];
  scrubber: Scrubber;
  lastRun: LastRun;
}

export class Scheduler {
  private period: number;
  private maxDuration: Duration;
  private filesystems: string[];
  private scrubber: Scrubber;
  private lastRun: LastRun;

  constructor(props: SchedulerProps) {
    this.period = props.period;
    if (props.maxDuration) {
      this.maxDuration = moment.duration(props.maxDuration);
    }
    this.filesystems = props.filesystems;
    this.scrubber = props.scrubber;
    this.lastRun = props.lastRun;
  }

  async run() {
    for (let filesystem of this.filesystems) {
      const lastRun = moment(this.lastRun[filesystem] ?? "1970");
      const nextRun = lastRun.add(this.period, "days");
      const now = moment();
      if (nextRun.isAfter(now)) {
        console.debug(
          `Skipping ${filesystem}, because its next run is on ${nextRun}`
        );
        continue;
      }
      const scrubStatus = await this.scrubber.status(filesystem);
      let timeout;
      if (this.maxDuration) {
        console.info(`Will cancel scrub after ${this.maxDuration}`);
        timeout = setTimeout(async () => {
          console.info(`Timeout reached. Cancelling scrub of ${filesystem}`);
          await this.scrubber.cancel(filesystem);
          console.info(`Scrub cancelled for ${filesystem}`);
        }, this.maxDuration.asMilliseconds());
      }
      if (scrubStatus.aborted) {
        console.info(`Resuming aborted scrub for ${filesystem}`);
        await this.scrubber.resume(filesystem);
      } else {
        console.info(`Scrubbing ${filesystem}`);
        await this.scrubber.scrub(filesystem);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
      this.lastRun[filesystem] = new Date().toISOString();
      return;
    }
  }
}
