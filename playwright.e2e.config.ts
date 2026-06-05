import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";

// Credentials and provisioned fixtures (project/suite/run/cases) are produced by the
// /e2e-setup skill, which rotates the demo-site API key and re-creates the data
// (the demo instance is wiped periodically) before writing this env file.
dotenv.config({ path: ".testrail-e2e.env" });

const suiteId = process.env.TESTRAIL_E2E_SUITE_ID
	? Number(process.env.TESTRAIL_E2E_SUITE_ID)
	: undefined;

// When a run id is provided, exercise Use Case 1 (report into an existing run).
// When it is absent, the reporter falls back to Use Case 2 (create a new run from
// projectId + suiteId).
const testRunId = process.env.TESTRAIL_E2E_RUN_ID
	? Number(process.env.TESTRAIL_E2E_RUN_ID)
	: undefined;

export default defineConfig({
	testDir: "./e2e",
	// Run against the real demo TestRail and report through THIS reporter (built to dist/).
	reporter: [
		["list"],
		[
			"./dist/index.es.js",
			{
				testRailHost: process.env.TESTRAIL_E2E_URL,
				username: process.env.TESTRAIL_E2E_USERNAME,
				apiKey: process.env.TESTRAIL_E2E_API_KEY,
				projectId: Number(process.env.TESTRAIL_E2E_PROJECT_ID),
				...(suiteId ? { suiteId } : {}),
				...(testRunId ? { testRunId } : {}),
			},
		],
	],
});
