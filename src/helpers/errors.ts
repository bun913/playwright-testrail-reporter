/**
 * Custom error class for TestRail reporter errors
 */
export class TestRailReporterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TestRailReporterError";
	}
}
