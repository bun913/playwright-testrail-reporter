import { TestRailReporterOptions } from "../config/index";
import { getTestRun, createTestRun, AddRunPayload } from "../api/testrailApi";
import { TestRailReporterError } from "../helpers/errors";

/**
 * Get an existing test run by ID
 * @param options TestRail reporter options
 * @param testRunId Test run ID
 * @returns Test run ID if successful
 * @throws TestRailReporterError if test run retrieval fails
 */
export async function findExistingTestRun(
	options: TestRailReporterOptions,
	testRunId: number,
): Promise<number> {
	try {
		const testRun = await getTestRun(options, testRunId);
		return testRun.id;
	} catch (error) {
		throw new TestRailReporterError(
			`Could not find or access test run with ID ${testRunId}`,
		);
	}
}

/**
 * Create a new test run with the given test cases
 * @param options TestRail reporter options
 * @param caseIds Array of test case IDs to include in the run
 * @returns Test run ID if successful
 * @throws TestRailReporterError if test run creation fails
 */
export async function createNewTestRun(
	options: TestRailReporterOptions,
	caseIds: number[],
): Promise<number> {
	try {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const payload: AddRunPayload = {
			name: `Playwright Test Run - ${timestamp}`,
			description: "Automated test run created by Playwright TestRail Reporter",
			include_all: false,
			case_ids: caseIds,
		};

		// Set suite_id if provided in options
		if (options.suiteId) {
			payload.suite_id = options.suiteId;
		}

		if (options.milestoneId) {
			payload.milestone_id = options.milestoneId;
		}

		const testRun = await createTestRun(options, payload);
		return testRun.id;
	} catch (error) {
		throw new TestRailReporterError("Failed to create new TestRail run");
	}
}

/**
 * Either finds an existing test run or creates a new one
 * @param options TestRail reporter options
 * @param caseIds Array of test case IDs to include in the run if creating a new run
 * @returns Test run ID
 * @throws TestRailReporterError if operation fails
 */
export async function createOrFindTestRun(
	options: TestRailReporterOptions,
	caseIds: number[],
): Promise<number> {
	// If testRunId is specified, try to use that existing run
	if (options.testRunId) {
		return await findExistingTestRun(options, options.testRunId);
	}

	// Otherwise create a new run
	return await createNewTestRun(options, caseIds);
}
