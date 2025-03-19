// src/config.ts
export interface TestRailReporterOptions {
  // TestRail connection details
  testRailHost: string;
  username: string;
  apiKey: string;

  // Project information
  projectId: number;

  // Use Case 1: Updating existing TestRun
  testRunId?: number;

  // Use Case 2: Creating new TestRun
  milestoneId?: number;
}

/**
 * Validates the provided TestRail reporter options
 * @param options The options to validate
 * @throws Error if any required option is missing
 */
export function validateOptions(options: Partial<TestRailReporterOptions>): void {
  if (!options.testRailHost) {
    throw new Error("TestRail host is required");
  }

  if (!options.username) {
    throw new Error("TestRail username is required");
  }

  if (!options.apiKey) {
    throw new Error("TestRail API key is required");
  }

  if (!options.projectId) {
    throw new Error("TestRail project ID is required");
  }

  // Either use existing TestRun or create a new one
  if (!options.testRunId && !options.milestoneId) {
    console.warn(
      "Neither testRunId nor milestoneId provided. A new TestRun will be created without milestone association."
    );
  }
}

/**
 * Merges provided options with defaults or environment variables
 * @param options Partial options provided by the user
 * @returns Complete options object
 */
export function mergeWithDefaults(options: Partial<TestRailReporterOptions> = {}): TestRailReporterOptions {
  const mergedOptions: TestRailReporterOptions = {
    testRailHost: options.testRailHost || "",
    username: options.username || "",
    apiKey: options.apiKey || "",
    projectId: options.projectId || 0,
    testRunId: options.testRunId,
    milestoneId: options.milestoneId,
  };

  return mergedOptions;
}
