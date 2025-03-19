import { describe, it, expect, vi } from "vitest";
import {
  validateOptions,
  mergeWithDefaults,
  TestRailReporterOptions,
} from "../../src/config";

describe("config", () => {
  describe("validateOptions", () => {
    it("should throw error when testRailHost is missing", () => {
      const options = {
        username: "user",
        apiKey: "key",
        projectId: 1,
      };

      expect(() => validateOptions(options)).toThrow(
        "TestRail host is required"
      );
    });

    it("should throw error when username is missing", () => {
      const options = {
        testRailHost: "https://example.testrail.com",
        apiKey: "key",
        projectId: 1,
      };

      expect(() => validateOptions(options)).toThrow(
        "TestRail username is required"
      );
    });

    it("should throw error when apiKey is missing", () => {
      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        projectId: 1,
      };

      expect(() => validateOptions(options)).toThrow(
        "TestRail API key is required"
      );
    });

    it("should throw error when projectId is missing", () => {
      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
      };

      expect(() => validateOptions(options)).toThrow(
        "TestRail project ID is required"
      );
    });

    it("should not throw error when all required fields are present", () => {
      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
      };

      expect(() => validateOptions(options)).not.toThrow();
    });

    it("should output warning when neither testRunId nor milestoneId is provided and no suiteId", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
      };

      validateOptions(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Creating a new test run without suiteId or milestone. TestRail may require a suite_id depending on project settings."
      );

      consoleSpy.mockRestore();
    });

    it("should output warning when suiteId is provided but no testRunId or milestoneId", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        suiteId: 5,
      };

      validateOptions(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Creating a new test run with suiteId but without milestone association."
      );

      consoleSpy.mockRestore();
    });

    it("should output warning when milestoneId is provided but no suiteId", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        milestoneId: 200,
      };

      validateOptions(options);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Creating a new test run with milestone, but no suiteId provided. TestRail may require a suite_id depending on project settings."
      );

      consoleSpy.mockRestore();
    });

    it("should not output warning when testRunId is provided", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        testRunId: 100,
      };

      validateOptions(options);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should not output warning when all necessary options are provided", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const options = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        suiteId: 5,
        milestoneId: 200,
      };

      validateOptions(options);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("mergeWithDefaults", () => {
    it("should merge options with defaults correctly", () => {
      const input = {
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        suiteId: 5,
        testRunId: 100,
      };

      const result = mergeWithDefaults(input);

      expect(result).toEqual({
        testRailHost: "https://example.testrail.com",
        username: "user",
        apiKey: "key",
        projectId: 1,
        suiteId: 5,
        testRunId: 100,
        milestoneId: undefined,
      });
    });

    it("should apply default values when options are empty", () => {
      const result = mergeWithDefaults({});

      expect(result).toEqual({
        testRailHost: "",
        username: "",
        apiKey: "",
        projectId: 0,
        suiteId: undefined,
        testRunId: undefined,
        milestoneId: undefined,
      });
    });

    it("should merge partial options with defaults", () => {
      const input = {
        testRailHost: "https://example.testrail.com",
        projectId: 1,
      };

      const result = mergeWithDefaults(input);

      expect(result).toEqual({
        testRailHost: "https://example.testrail.com",
        username: "",
        apiKey: "",
        projectId: 1,
        suiteId: undefined,
        testRunId: undefined,
        milestoneId: undefined,
      });
    });
  });
}); 