import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatTestResult,
  createTestCaseResult,
  reportResultsToTestRail,
} from "../../src/results/resultsReporter";
import { TestStatus } from "../../src/api/testrailApi";
import { TestRailReporterError } from "../../src/helpers/errors";
import * as formatter from "../../src/helpers/formatter";
import * as statusMapper from "../../src/helpers/statusMapper";
import * as testrailApi from "../../src/api/testrailApi";

// モックデータ
const mockPassedResult = {
  status: 'passed',
  duration: 5000 // 5秒
};

const mockFailedResult = {
  status: 'failed',
  duration: 10000, // 10秒
  error: new Error('Test failed with an error')
};

const mockSkippedResult = {
  status: 'skipped',
  duration: 0
};

describe("resultsReporter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("formatTestResult", () => {
    it("should format passed test result", () => {
      const result = formatTestResult(mockPassedResult as any);
      expect(result).toContain("✅ Test passed in 5s");
    });

    it("should format failed test result", () => {
      vi.spyOn(formatter, 'formatErrorMessage').mockReturnValue('Formatted error message');

      const result = formatTestResult(mockFailedResult as any);
      expect(result).toContain("❌ Test failed in 10s");
      expect(formatter.formatErrorMessage).toHaveBeenCalled();
    });

    it("should format skipped test result", () => {
      const result = formatTestResult(mockSkippedResult as any);
      expect(result).toBe("⏩ Test was skipped");
    });
  });

  describe("createTestCaseResult", () => {
    it("should create test case result for passed test", () => {
      vi.spyOn(statusMapper, 'mapTestStatus').mockReturnValue(TestStatus.Passed);

      const result = createTestCaseResult(12345, mockPassedResult as any);

      expect(result).toHaveProperty('caseId', 12345);
      expect(result).toHaveProperty('status', TestStatus.Passed);
      expect(result).toHaveProperty('comment');
      expect(statusMapper.mapTestStatus).toHaveBeenCalledWith('passed');
    });
  });

  describe("reportResultsToTestRail", () => {
    const mockOptions = {
      testRailHost: "https://example.testrail.io",
      username: "test@example.com",
      apiKey: "test-api-key",
      projectId: 1,
    } as any;

    it("should successfully report results for all cases", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockResolvedValue({ id: 1 } as any);

      const results = new Map([
        [
          123,
          {
            caseId: 123,
            status: TestStatus.Passed,
            comment: "✅ Test passed in 5s",
          },
        ],
        [
          124,
          {
            caseId: 124,
            status: TestStatus.Failed,
            comment: "❌ Test failed in 10s\n\nError message",
          },
        ],
      ]);

      vi.stubEnv("TEST_VERSION", "v1.0.0");
      vi.stubEnv("TEST_ENVIRONMENT", "production");

      await reportResultsToTestRail(mockOptions, 42, results);

      expect(addResultForCaseMock).toHaveBeenCalledTimes(2);
      expect(addResultForCaseMock).toHaveBeenCalledWith(mockOptions, 42, 123, {
        status_id: TestStatus.Passed,
        comment: "✅ Test passed in 5s",
        version: "v1.0.0",
        custom_fields: {
          environment: "production",
        },
      });
      expect(addResultForCaseMock).toHaveBeenCalledWith(mockOptions, 42, 124, {
        status_id: TestStatus.Failed,
        comment: "❌ Test failed in 10s\n\nError message",
        version: "v1.0.0",
        custom_fields: {
          environment: "production",
        },
      });

      addResultForCaseMock.mockRestore();
    });

    it("should use CI_COMMIT_SHA as fallback version when TEST_VERSION is not set", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockResolvedValue({ id: 1 } as any);

      const results = new Map([
        [
          123,
          {
            caseId: 123,
            status: TestStatus.Passed,
            comment: "Test passed",
          },
        ],
      ]);

      vi.unstubAllEnvs();
      vi.stubEnv("CI_COMMIT_SHA", "abc123def456");
      vi.stubEnv("TEST_ENVIRONMENT", "staging");

      await reportResultsToTestRail(mockOptions, 42, results);

      expect(addResultForCaseMock).toHaveBeenCalledWith(
        mockOptions,
        42,
        123,
        expect.objectContaining({
          version: "abc123def456",
        }),
      );

      addResultForCaseMock.mockRestore();
    });

    it("should use empty string for version when neither TEST_VERSION nor CI_COMMIT_SHA is set", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockResolvedValue({ id: 1 } as any);

      const results = new Map([
        [
          123,
          {
            caseId: 123,
            status: TestStatus.Passed,
            comment: "Test passed",
          },
        ],
      ]);

      vi.unstubAllEnvs();
      vi.stubEnv("TEST_ENVIRONMENT", "test");

      await reportResultsToTestRail(mockOptions, 42, results);

      expect(addResultForCaseMock).toHaveBeenCalledWith(
        mockOptions,
        42,
        123,
        expect.objectContaining({
          version: "",
        }),
      );

      addResultForCaseMock.mockRestore();
    });

    it("should throw TestRailReporterError when any case fails to report", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockResolvedValueOnce({ id: 1 } as any)
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({ id: 3 } as any);

      const results = new Map([
        [
          123,
          {
            caseId: 123,
            status: TestStatus.Passed,
            comment: "Test passed",
          },
        ],
        [
          124,
          {
            caseId: 124,
            status: TestStatus.Failed,
            comment: "Test failed",
          },
        ],
        [
          125,
          {
            caseId: 125,
            status: TestStatus.Passed,
            comment: "Test passed",
          },
        ],
      ]);

      vi.unstubAllEnvs();
      vi.stubEnv("TEST_ENVIRONMENT", "test");

      await expect(reportResultsToTestRail(mockOptions, 42, results)).rejects.toThrow(
        TestRailReporterError,
      );
      await expect(reportResultsToTestRail(mockOptions, 42, results)).rejects.toThrow(
        /Failed to report results for \d+ test cases/,
      );

      addResultForCaseMock.mockRestore();
    });

    it("should continue processing all cases even if some fail", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockRejectedValueOnce(new Error("API Error 1"))
        .mockResolvedValueOnce({ id: 2 } as any)
        .mockRejectedValueOnce(new Error("API Error 2"));

      const results = new Map([
        [
          123,
          {
            caseId: 123,
            status: TestStatus.Passed,
            comment: "Test 1",
          },
        ],
        [
          124,
          {
            caseId: 124,
            status: TestStatus.Passed,
            comment: "Test 2",
          },
        ],
        [
          125,
          {
            caseId: 125,
            status: TestStatus.Passed,
            comment: "Test 3",
          },
        ],
      ]);

      vi.unstubAllEnvs();
      vi.stubEnv("TEST_ENVIRONMENT", "test");

      await expect(reportResultsToTestRail(mockOptions, 42, results)).rejects.toThrow(
        TestRailReporterError,
      );

      expect(addResultForCaseMock).toHaveBeenCalledTimes(3);

      addResultForCaseMock.mockRestore();
    });

    it("should handle empty results map", async () => {
      const addResultForCaseMock = vi.spyOn(testrailApi, "addResultForCase");

      const results = new Map([]);

      await reportResultsToTestRail(mockOptions, 42, results);

      expect(addResultForCaseMock).not.toHaveBeenCalled();

      addResultForCaseMock.mockRestore();
    });

    it("should handle multiple failures and report correct count", async () => {
      const addResultForCaseMock = vi
        .spyOn(testrailApi, "addResultForCase")
        .mockRejectedValue(new Error("API Error"));

      const results = new Map([
        [100, { caseId: 100, status: TestStatus.Passed, comment: "Test 1" }],
        [101, { caseId: 101, status: TestStatus.Passed, comment: "Test 2" }],
        [102, { caseId: 102, status: TestStatus.Passed, comment: "Test 3" }],
        [103, { caseId: 103, status: TestStatus.Passed, comment: "Test 4" }],
        [104, { caseId: 104, status: TestStatus.Passed, comment: "Test 5" }],
      ]);

      vi.unstubAllEnvs();
      vi.stubEnv("TEST_ENVIRONMENT", "test");

      await expect(reportResultsToTestRail(mockOptions, 42, results)).rejects.toThrow(
        "Failed to report results for 5 test cases",
      );

      addResultForCaseMock.mockRestore();
    });
  });
});