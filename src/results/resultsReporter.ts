import { TestResult } from "@playwright/test/reporter";
import { TestRailReporterOptions } from "../config/index";
import { addResultForCase, TestStatus } from "../api/testrailApi";
import { TestRailReporterError } from "../helpers/errors";
import { formatErrorMessage } from "../helpers/formatter";
import { mapTestStatus } from "../helpers/statusMapper";

/**
 * A test result ready to be reported to TestRail
 */
export interface TestCaseResult {
	caseId: number;
	status: TestStatus;
	comment: string;
}

/**
 * Formats a test result for reporting to TestRail
 * @param testResult Playwright test result
 * @param duration Test duration in seconds
 * @returns Formatted comment
 */
export function formatTestResult(testResult: TestResult): string {
	const duration = testResult.duration
		? `${Math.round(testResult.duration / 1000)}s`
		: "";

	if (testResult.status === "passed") {
		return `✅ Test passed in ${duration}`;
	} else if (testResult.status === "failed") {
		return `❌ Test failed in ${duration}\n\n${formatErrorMessage(testResult.error)}`;
	} else if (testResult.status === "skipped") {
		return "⏩ Test was skipped";
	} else {
		return `⚠️ Test result: ${testResult.status}`;
	}
}

/**
 * Creates a test case result object ready for submission to TestRail
 * @param caseId TestRail case ID
 * @param testResult Playwright test result
 * @returns Test case result object
 */
export function createTestCaseResult(
	caseId: number,
	testResult: TestResult,
): TestCaseResult {
	return {
		caseId,
		status: mapTestStatus(testResult.status),
		comment: formatTestResult(testResult),
	};
}

/**
 * Reports multiple test results to TestRail
 * @param options TestRail reporter options
 * @param testRunId TestRail run ID
 * @param results Map of case IDs to test results
 * @throws TestRailReporterError if reporting fails
 */
export async function reportResultsToTestRail(
	options: TestRailReporterOptions,
	testRunId: number,
	results: Map<number, TestCaseResult>,
): Promise<void> {
	const failedCases: number[] = [];

	for (const [caseId, { status, comment }] of results.entries()) {
		try {
			await addResultForCase(options, testRunId, caseId, {
				status_id: status,
				comment,
				version: process.env.TEST_VERSION || process.env.CI_COMMIT_SHA || "",
			});
		} catch (error) {
			failedCases.push(caseId);
		}
	}

	// If any cases failed to report, throw an error
	if (failedCases.length > 0) {
		throw new TestRailReporterError(
			`Failed to report results for ${failedCases.length} test cases`,
		);
	}
}
