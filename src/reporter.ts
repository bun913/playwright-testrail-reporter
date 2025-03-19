import { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import {
	TestRailReporterOptions,
	validateOptions,
	mergeWithDefaults,
} from "./config/index";
import { extractCaseIdFromTest } from "./helpers/caseExtractor";
import { verifyConnection } from "./testrail/connection";
import { createOrFindTestRun } from "./testrail/testRun";
import {
	TestCaseResult,
	createTestCaseResult,
	reportResultsToTestRail,
} from "./results/resultsReporter";

/**
 * TestRail Reporter implementation for Playwright
 */
export default class TestRailReporter implements Reporter {
	private options: TestRailReporterOptions;
	private testResults: Map<number, TestCaseResult> = new Map();
	private pendingCases: number = 0;

	constructor(options = {}) {
		this.options = mergeWithDefaults(options);

		// Validate options synchronously - if invalid, throws immediately
		validateOptions(this.options);
	}

	/**
	 * Called when a test is finished - this is called for each individual test
	 * Playwright invokes this after each test completes (pass, fail, or skip)
	 */
	onTestEnd(test: TestCase, result: TestResult): void {
		const caseId = extractCaseIdFromTest(test.title, test.location.file);
		if (!caseId) return;

		this.pendingCases++;
		this.testResults.set(caseId, createTestCaseResult(caseId, result));
	}

	/**
	 * Called when the test run is finished
	 * Handles all TestRail interaction including connection, test run setup, and results reporting
	 * Playwright calls this once at the end of all tests
	 */
	async onEnd(): Promise<void> {
		// Skip if no testcases were found
		if (this.pendingCases === 0) return;

		// Step 1: Verify connection to TestRail
		await verifyConnection(this.options);

		// Step 2: Find existing or create new test run
		const caseIds = Array.from(this.testResults.keys());
		const testRunId = await createOrFindTestRun(this.options, caseIds);

		// Step 3: Report results to TestRail
		await reportResultsToTestRail(this.options, testRunId, this.testResults);
	}
}
