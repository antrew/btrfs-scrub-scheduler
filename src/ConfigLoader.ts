import { Configuration } from "./Configuration";
import moment, { Duration } from "moment";

export class ConfigLoader {
  load(config: any): Configuration {
    const givenPeriod = config.period;
    let period: Duration;
    if (Number.isInteger(givenPeriod) || givenPeriod.match(/^\d+$/)) {
      period = moment.duration(`P${givenPeriod}D`);
    } else {
      period = moment.duration(config.period);
    }
    const givenMaxDuration = config.maxDuration;
    let maxDuration: Duration = givenMaxDuration
      ? moment.duration(givenMaxDuration)
      : undefined;
    return {
      period,
      maxDuration,
      filesystems: config.filesystems,
    };
  }
}
