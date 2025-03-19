/**
 * Playwright TestRail Reporter
 *
 * A Playwright reporter that integrates with TestRail to report test results.
 *
 * Configuration in your playwright.config.ts:
 *
 * ```ts
 * import { createReporter } from 'playwright-testrail-reporter';
 *
 * export default defineConfig({
 *   reporter: [
 *     ['list'],
 *     ['html'],
 *     ['playwright-testrail-reporter', {
 *       testRailHost: 'https://example.testrail.com',
 *       username: 'user@example.com',
 *       apiKey: 'your-api-key',
 *       projectId: 1,
 *       // Either provide a testRunId to use an existing run
 *       testRunId: 123,
 *       // Or provide a milestoneId to create a new run under a milestone
 *       milestoneId: 456
 *     }]
 *   ],
 *   // Other Playwright config...
 * });
 * ```
 *
 * Your test titles should include the TestRail case ID in one of these formats:
 * - "C12345 Your test description"
 * - "[C12345] Your test description"
 */

import TestRailReporter from "./reporter";
import { TestRailReporterOptions } from "./config/index";
import { TestStatus } from "./api/testrailApi";

/**
 * Factory function to create a new TestRailReporter instance
 * @param options Configuration options for the reporter
 * @returns A new TestRailReporter instance
 */
export function createReporter(
	options: Partial<TestRailReporterOptions> = {},
): TestRailReporter {
	return new TestRailReporter(options);
}

// Export types and utility functions
export { TestRailReporter };
export type { TestRailReporterOptions };
export { TestStatus };

// Export helper functions for direct use if needed
export { extractCaseId } from "./helpers/caseExtractor";
export { mapTestStatus } from "./helpers/statusMapper";
export { formatErrorMessage } from "./helpers/formatter";
