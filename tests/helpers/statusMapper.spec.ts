import { describe, it, expect } from "vitest";
import { mapTestStatus } from "../../src/helpers/statusMapper";
import { TestStatus } from "../../src/api/testrailApi";

describe("statusMapper", () => {
  describe("mapTestStatus", () => {
    it("should map 'passed' to TestStatus.Passed", () => {
      expect(mapTestStatus("passed")).toBe(TestStatus.Passed);
    });

    it("should map 'failed' to TestStatus.Failed", () => {
      expect(mapTestStatus("failed")).toBe(TestStatus.Failed);
    });

    it("should map 'skipped' to TestStatus.Untested", () => {
      expect(mapTestStatus("skipped")).toBe(TestStatus.Untested);
    });

    it("should map 'todo' to TestStatus.Untested", () => {
      expect(mapTestStatus("todo")).toBe(TestStatus.Untested);
    });

    it("should map 'blocked' to TestStatus.Blocked", () => {
      expect(mapTestStatus("blocked")).toBe(TestStatus.Blocked);
    });

    it("should map unknown statuses to TestStatus.Untested", () => {
      expect(mapTestStatus("unknown")).toBe(TestStatus.Untested);
    });

    it("should be case insensitive", () => {
      expect(mapTestStatus("PASSED")).toBe(TestStatus.Passed);
    });
  });
}); 