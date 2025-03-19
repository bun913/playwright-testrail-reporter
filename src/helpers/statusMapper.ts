import { TestStatus } from "../api/testrailApi";

/**
 * Maps a test result to a TestRail status ID
 *
 * @param status Test status string ('passed', 'failed', 'skipped', etc.)
 * @returns The corresponding TestRail status ID
 */
export function mapTestStatus(status: string): TestStatus {
	switch (status.toLowerCase()) {
		case "passed":
			return TestStatus.Passed;
		case "failed":
			return TestStatus.Failed;
		case "skipped":
		case "todo":
			return TestStatus.Untested;
		case "blocked":
			return TestStatus.Blocked;
		default:
			return TestStatus.Untested;
	}
}
