import { TestRailReporterOptions } from "../config/index";
import { getProject } from "../api/testrailApi";
import { TestRailReporterError } from "../helpers/errors";

/**
 * Verify connection to TestRail by retrieving project information
 * Validates that credentials work and project exists
 *
 * @param options TestRail reporter options
 * @returns Project name and ID
 * @throws TestRailReporterError if connection fails
 */
export async function verifyConnection(
	options: TestRailReporterOptions,
): Promise<{ name: string; id: number }> {
	try {
		const project = await getProject(options);
		return { name: project.name, id: project.id };
	} catch (error) {
		throw new TestRailReporterError(
			`Failed to connect to TestRail: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
