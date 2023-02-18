import { Scrubber } from "./Scrubber";
import { ChildProcess, exec } from "child_process";

jest.mock("child_process");

it.each([
  [
    "not aborted",
    "\nscrub started at Sun Feb 12 11:52:25 2023 and finished after 00:01:41\n",
    false,
  ],
  [
    "aborted",
    "\nscrub started at Wed Feb 15 00:00:14 2023 and was aborted after 09:01:30\n",
    true,
  ],
])(
  "should detect aborted status %s",
  async (description, givenOuput, expectedAbortedStatus) => {
    let callback;
    jest.mocked(exec).mockImplementation((command: string, callback_) => {
      callback = callback_;
      return undefined as ChildProcess;
    });
    const scrubber = new Scrubber();
    const statusPromise = scrubber.status("/test");
    callback(null, givenOuput, "");
    const status = await statusPromise;
    expect(status.aborted).toEqual(expectedAbortedStatus);
  }
);
