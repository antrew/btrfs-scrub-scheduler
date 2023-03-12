import { Configuration } from "./Configuration";
import { Scrubber } from "./Scrubber";
import { LastRun } from "./LastRun";
import moment, { Duration } from "moment";

interface SchedulerProps extends Configuration {
  scrubber: Scrubber;
  lastRun: LastRun;
}

export class Scheduler {
  private period: Duration;
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
      const nextRun = lastRun.add(this.period);
      const now = moment();
      if (nextRun.isAfter(now)) {
        console.debug(
          `Skipping ${filesystem}, because its next run is on ${nextRun}`
        );
        continue;
      }
      const scrubStatus = await this.scrubber.status(filesystem);
      let timeout;
      let wasInterrupted = false;
      if (this.maxDuration) {
        console.info(`Will cancel scrub after ${this.maxDuration}`);
        timeout = setTimeout(async () => {
          console.info(`Timeout reached. Cancelling scrub of ${filesystem}`);
          wasInterrupted = true;
          await this.scrubber.cancel(filesystem);
          console.info(`Scrub cancelled for ${filesystem}`);
        }, this.maxDuration.asMilliseconds());
      }
      try {
        if (scrubStatus.aborted) {
          console.info(`Resuming aborted scrub for ${filesystem}`);
          await this.scrubber.resume(filesystem);
        } else {
          console.info(`Scrubbing ${filesystem}`);
          await this.scrubber.scrub(filesystem);
        }
      } catch (error) {
        if (wasInterrupted) {
          // this was expected
        } else {
          throw error;
        }
      }
      if (timeout) {
        clearTimeout(timeout);
      }
      if (!wasInterrupted) {
        this.lastRun[filesystem] = new Date().toISOString();
      }
      return;
    }
  }
}
