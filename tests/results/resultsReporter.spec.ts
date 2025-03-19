import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatTestResult, createTestCaseResult } from "../../src/results/resultsReporter";
import { TestStatus } from "../../src/api/testrailApi";
import * as formatter from "../../src/helpers/formatter";
import * as statusMapper from "../../src/helpers/statusMapper";

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
}); 