import { ConfigLoader } from "./ConfigLoader";
import { Configuration } from "./Configuration";
import moment from "moment";

let configLoader: ConfigLoader;

beforeEach(() => {
  configLoader = new ConfigLoader();
});

describe("should parse scrub period", () => {
  it.each([
    ["number of days as number", 30, "P30D"],
    ["number of days as string", "30", "P30D"],
    ["ISO 8601", "P30D", "P30D"],
  ])(
    "%s: %s -> %s",
    (description, givenPeriod: string | number, expectedPeriod: string) => {
      const result: Configuration = configLoader.load({
        period: givenPeriod,
      });
      expect(result.period).toEqual(moment.duration(expectedPeriod));
    }
  );
});

describe("should parse max duration", () => {
  it.each([
    ["default value", undefined, undefined],
    ["human readable HH:MM", "7:30", "PT7H30M"],
    ["human readable HH:MM:SS", "7:30:00", "PT7H30M"],
    ["ISO 8601", "PT7H30M", "PT7H30M"],
  ])(
    "%s: %s -> %s",
    (
      description,
      givenMaxDuration: string | undefined,
      expectedMaxDuration: string
    ) => {
      const result: Configuration = configLoader.load({
        period: 30,
        maxDuration: givenMaxDuration,
      });
      if (expectedMaxDuration) {
        expect(result.maxDuration).toEqual(
          moment.duration(expectedMaxDuration)
        );
      } else {
        expect(result.maxDuration).toBeUndefined();
      }
    }
  );
});
