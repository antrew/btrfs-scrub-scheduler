import { Configuration } from "./Configuration";
import { Scrubber } from "./Scrubber";
import { LastRun } from "./LastRun";
import moment from "moment";

interface SchedulerProps {
  period: number;
  filesystems: string[];
  scrubber: Scrubber;
  lastRun: LastRun;
}

export class Scheduler {
  private period: number;
  private filesystems: string[];
  private scrubber: Scrubber;
  private lastRun: LastRun;

  constructor(props: SchedulerProps) {
    this.period = props.period;
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
      console.debug(`Scrubbing ${filesystem}`);
      await this.scrubber.scrub(filesystem);
      this.lastRun[filesystem] = new Date().toISOString();
      return;
    }
  }
}
