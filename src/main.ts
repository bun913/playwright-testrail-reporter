import type {
	FullConfig,
	FullResult,
	Reporter,
	Suite,
	TestCase,
	TestResult,
} from "@playwright/test/reporter";
import {
	mergeWithDefaults,
	TestRailReporterOptions,
	validateOptions,
} from "./config";

class TestRailReporter implements Reporter {
	private options: TestRailReporterOptions;

	constructor(options: Partial<TestRailReporterOptions> = {}) {
		// Merge options with environment variables as fallback
		this.options = {
			testRailHost: options.testRailHost || "",
			username: options.username || "",
			apiKey: options.apiKey || "",
			projectId: options.projectId || 0,
			testRunId: options.testRunId,
			milestoneId: options.milestoneId,
		};

		this.options = mergeWithDefaults(this.options);
		validateOptions(this.options);
	}

	onBegin(config: FullConfig, suite: Suite) {
		console.log(`Starting the run with ${suite.allTests().length} tests`);
		// TODO: If testRunId is not provided, create a new TestRun
	}

	onTestBegin(test: TestCase, result: TestResult) {
		console.log(`Starting test ${test.title}`);
		// TODO: Extract TestRail case ID from test title if available
	}

	onTestEnd(test: TestCase, result: TestResult) {
		console.log(`Finished test ${test.title}: ${result.status}`);
		// TODO: Update TestRail with test result
	}

	onEnd(result: FullResult) {
		console.log(`Finished the run: ${result.status}`);
		// TODO: Finalize reporting to TestRail
	}
}

export default TestRailReporter;
console.log("HeyHeyHey");
