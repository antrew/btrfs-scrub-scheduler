import { Scheduler } from "./Scheduler";
import { Scrubber } from "./Scrubber";
import { Configuration } from "./Configuration";
import { LastRun } from "./LastRun";
import moment from "moment";
import mocked = jest.mocked;

jest.mock("./Scrubber");

const NOW = "2023-02-01T00:00:00.000Z";

jest.useFakeTimers();

let scrubber;

beforeEach(() => {
  jest.setSystemTime(moment(NOW).valueOf());
  scrubber = new Scrubber();
  mocked(scrubber.status).mockResolvedValue({ aborted: false });
});

it("should scrub when no previous runs", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/test"],
  };
  const lastRun: LastRun = {};
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
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.scrub).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({
    "/mnt/a": NOW,
  });
});

it("should cancel a running scrub at the end of the maintenance window", async () => {
  const configuration: Configuration = {
    period: 30,
    maxDuration: "PT1H",
    filesystems: ["/mnt/test"],
  };
  const lastRun: LastRun = {};
  let rejectScrub;
  let scrubCalledResolve;
  const scrubCalledPromise = new Promise((resolve) => {
    scrubCalledResolve = resolve;
  });
  mocked(scrubber.scrub).mockImplementation(() => {
    scrubCalledResolve();
    return new Promise((resolve, reject) => {
      console.debug("promise here");
      rejectScrub = reject;
    });
  });

  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  const schedulerPromise = scheduler.run();
  await scrubCalledPromise;
  jest.advanceTimersByTime(moment.duration("PT1H").asMilliseconds() * 1.1);
  rejectScrub(new Error());
  await schedulerPromise;

  expect(scrubber.status).toHaveBeenCalledTimes(1);
  expect(scrubber.scrub).toHaveBeenCalledTimes(1);
  expect(scrubber.cancel).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({});
});

it("should resume a cancelled scrub instead of starting a new one", async () => {
  const configuration: Configuration = {
    period: 30,
    filesystems: ["/mnt/test"],
  };
  const lastRun: LastRun = {};
  mocked(scrubber.status).mockResolvedValue({ aborted: true });
  const scheduler = new Scheduler({ ...configuration, lastRun, scrubber });
  await scheduler.run();
  expect(scrubber.resume).toHaveBeenCalledTimes(1);
  expect(lastRun).toEqual({ "/mnt/test": NOW });
});
