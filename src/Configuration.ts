import { Duration } from "moment";

export interface Configuration {
  // how often to scrub in days
  period: Duration;
  // (optional) maximum duration of a single run, e.g. PT7H for 7 hours
  maxDuration?: Duration;
  // list of filesystems to scrub
  filesystems: string[];
}
