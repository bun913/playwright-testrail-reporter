/**
 * Playwright TestRail Reporter
 *
 * A Playwright reporter that integrates with TestRail to report test results.
 *
 * Configuration in your playwright.config.ts:
 *
 * ```ts
 * import { defineConfig } from '@playwright/test';
 * import { PlaywrightTestRailReporter } from 'playwright-testrail-reporter';
 *
 * export default defineConfig({
 *   reporter: [
 *     ['list'],
 *     ['html'],
 *     [PlaywrightTestRailReporter, {
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
import { extractCaseId } from "./helpers/caseExtractor";
import { mapTestStatus } from "./helpers/statusMapper";
import { formatErrorMessage } from "./helpers/formatter";

/**
 * Main reporter class for Playwright integration with TestRail
 */
export default class PlaywrightTestRailReporter extends TestRailReporter {
	/**
	 * Creates a new TestRailReporter instance
	 * @param options Configuration options for the reporter
	 */
	constructor(options: Partial<TestRailReporterOptions> = {}) {
		super(options);
	}

	// Static utility methods to allow direct access to helper functions
	static extractCaseId = extractCaseId;
	static mapTestStatus = mapTestStatus;
	static formatErrorMessage = formatErrorMessage;
	static TestStatus = TestStatus;
}

// Re-export important types to maintain backward compatibility
export type { TestRailReporterOptions };
export { TestStatus };
