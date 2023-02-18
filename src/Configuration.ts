export interface Configuration {
  // how often to scrub in days
  period: number;
  // (optional) maximum duration of a single run, e.g. PT7H for 7 hours
  maxDuration?: string;
  // list of filesystems to scrub
  filesystems: string[];
}
