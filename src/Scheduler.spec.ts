import { Scheduler } from "./Scheduler";
import { Scrubber } from "./Scrubber";
import { Configuration } from "./Configuration";
import { LastRun } from "./LastRun";
import moment from "moment";

jest.mock("./Scrubber");

const NOW = "2023-02-01T00:00:00.000Z";

jest.useFakeTimers({
  now: moment(NOW).valueOf(),
});

it("should scrub when no previous runs", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/test"],
  };
  const lastRun: LastRun = {};
  const scrubber = new Scrubber();
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.scrub).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({
    "/mnt/test": NOW,
  });
});

it("should scrub when previous run is too old", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/test"],
  };
  const lastRun: LastRun = { "/mnt/test": "2023-01-01" };
  const scrubber = new Scrubber();
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.scrub).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({
    "/mnt/test": NOW,
  });
});

it("should not scrub when previous run is not too old", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/test"],
  };
  const LAST_RUN = "2023-01-15";
  const lastRun: LastRun = { "/mnt/test": LAST_RUN };
  const scrubber = new Scrubber();
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.scrub).toHaveBeenCalledTimes(0);
  expect(lastRun).toEqual({
    "/mnt/test": LAST_RUN,
  });
});

it("should scrub only one filesystem", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/a", "/mnt/b", "/mnt/c"],
  };
  const lastRun: LastRun = {};
  const scrubber = new Scrubber();
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.scrub).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({
    "/mnt/a": NOW,
  });
});