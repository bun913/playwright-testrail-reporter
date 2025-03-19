// src/api/testrailApi.ts
import axios from "axios";
import { TestRailReporterOptions } from "../config";

/**
 * TestRail API Response for Project
 */
export interface TestRailProject {
	id: number;
	name: string;
	announcement: string;
	show_announcement: boolean;
	is_completed: boolean;
	completed_on: number | null;
	suite_mode: number;
	url: string;
}

/**
 * TestRail API Response for Run
 */
export interface TestRailRun {
	id: number;
	suite_id: number;
	name: string;
	description: string;
	milestone_id: number | null;
	assignedto_id: number | null;
	include_all: boolean;
	is_completed: boolean;
	completed_on: number | null;
	config: string | null;
	config_ids: number[];
	passed_count: number;
	blocked_count: number;
	untested_count: number;
	retest_count: number;
	failed_count: number;
	custom_status_count: Record<string, number>;
	created_on: number;
	created_by: number;
	url: string;
}

/**
 * TestRail API Response for Result
 */
export interface TestRailResult {
	id: number;
	test_id: number;
	status_id: number;
	created_on: number;
	assignedto_id: number | null;
	comment: string;
	version: string;
	elapsed: string;
	defects: string;
	custom_fields?: Record<string, any>;
}

/**
 * Payload for creating a new test run
 */
export interface AddRunPayload {
	suite_id?: number;
	name: string;
	description?: string;
	milestone_id?: number;
	assignedto_id?: number;
	include_all?: boolean;
	case_ids?: number[];
}

/**
 * Payload for adding a test result
 */
export interface AddResultPayload {
	status_id: number;
	comment?: string;
	version?: string;
	elapsed?: string;
	defects?: string;
	assignedto_id?: number;
	custom_fields?: Record<string, any>;
}

/**
 * Status IDs used in TestRail
 */
export enum TestStatus {
	Passed = 1,
	Blocked = 2,
	Untested = 3,
	Retest = 4,
	Failed = 5,
}

/**
 * Create an axios client configured for TestRail API
 * @param options TestRail configuration options
 */
function createApiClient(options: TestRailReporterOptions) {
	return axios.create({
		baseURL: `${options.testRailHost}/index.php?/api/v2`,
		headers: {
			"Content-Type": "application/json",
		},
		auth: {
			username: options.username,
			password: options.apiKey,
		},
	});
}

/**
 * Handle API errors with better logging
 * @param message Context message for the error
 * @param error The original error
 */
function handleApiError(message: string, error: any): void {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status;
		const responseData = error.response?.data;

		console.error(`${message}: HTTP ${status}`);
		if (responseData) {
			console.error("Response:", JSON.stringify(responseData, null, 2));
		}
	} else {
		console.error(`${message}:`, error);
	}
}

/**
 * Get project information by ID
 * @param options TestRail configuration options
 * @param projectId The ID of the project to fetch
 * @returns Promise resolving to project information
 */
export async function getProject(
	options: TestRailReporterOptions,
	projectId: number = options.projectId,
): Promise<TestRailProject> {
	const client = createApiClient(options);

	try {
		const response = await client.get(`/get_project/${projectId}`);
		return response.data;
	} catch (error) {
		handleApiError("Failed to get project", error);
		throw error;
	}
}

/**
 * Create a new test run
 * @param options TestRail configuration options
 * @param payload Data for the new test run
 * @param projectId The ID of the project
 * @returns Promise resolving to the created test run
 */
export async function createTestRun(
	options: TestRailReporterOptions,
	payload: AddRunPayload,
	projectId: number = options.projectId,
): Promise<TestRailRun> {
	const client = createApiClient(options);

	try {
		const response = await client.post(`/add_run/${projectId}`, payload);
		return response.data;
	} catch (error) {
		handleApiError("Failed to create test run", error);
		throw error;
	}
}

/**
 * Get test run information by ID
 * @param options TestRail configuration options
 * @param runId The ID of the test run
 * @returns Promise resolving to test run information
 */
export async function getTestRun(
	options: TestRailReporterOptions,
	runId: number,
): Promise<TestRailRun> {
	const client = createApiClient(options);

	try {
		const response = await client.get(`/get_run/${runId}`);
		return response.data;
	} catch (error) {
		handleApiError("Failed to get test run", error);
		throw error;
	}
}

/**
 * Add a test result for a specific test case in a test run
 * @param options TestRail configuration options
 * @param runId The ID of the test run
 * @param caseId The ID of the test case
 * @param payload The test result data
 * @returns Promise resolving to the created test result or null if skipped due to 400 error
 */
export async function addResultForCase(
	options: TestRailReporterOptions,
	runId: number,
	caseId: number,
	payload: AddResultPayload,
): Promise<TestRailResult | null> {
	const client = createApiClient(options);

	try {
		const response = await client.post(
			`/add_result_for_case/${runId}/${caseId}`,
			payload,
		);
		return response.data;
	} catch (error) {
		// 400エラーの場合は、ログを出力してスキップ（ユーザーのTestID指定ミスの可能性）
		if (axios.isAxiosError(error) && error.response?.status === 400) {
			console.error(
				`Skipping result for case ${caseId} in run ${runId} due to 400 Bad Request`,
			);
			if (error.response?.data) {
				console.error(
					"Response:",
					JSON.stringify(error.response.data, null, 2),
				);
			}
			return null;
		}

		// その他のエラーは通常通り処理
		handleApiError(
			`Failed to add result for case ${caseId} in run ${runId}`,
			error,
		);
		throw error;
	}
}
