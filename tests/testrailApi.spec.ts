import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import {
  getProject,
  createTestRun,
  getTestRun,
  addResultForCase,
  TestStatus,
} from "../src/testrailApi";
import { TestRailReporterOptions } from "../src/config";

// Mocking axios
vi.mock("axios");

// Spy on console.error instead of mocking it completely
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

const mockedAxios = axios as unknown as {
  create: ReturnType<typeof vi.fn>;
  isAxiosError: ReturnType<typeof vi.fn>;
};

describe("TestRail API Client", () => {
  // Sample test data
  const options: TestRailReporterOptions = {
    testRailHost: "https://example.testrail.com",
    username: "test@example.com",
    apiKey: "testkey123",
    projectId: 1,
  };

  const mockClient = {
    get: vi.fn(),
    post: vi.fn(),
  };

  beforeEach(() => {
    // Reset and setup mocks
    vi.resetAllMocks();
    (mockedAxios.create as any).mockReturnValue(mockClient);
    (mockedAxios.isAxiosError as any) = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getProject", () => {
    it("should fetch project details successfully", async () => {
      const projectData = {
        id: 1,
        name: "Test Project",
        announcement: "Test announcement",
        show_announcement: true,
        is_completed: false,
        completed_on: null,
        suite_mode: 3,
        url: "https://example.testrail.com/index.php?/projects/overview/1",
      };

      mockClient.get.mockResolvedValueOnce({ data: projectData });

      const result = await getProject(options);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: "https://example.testrail.com/index.php?/api/v2",
        headers: { "Content-Type": "application/json" },
        auth: {
          username: "test@example.com",
          password: "testkey123",
        },
      });

      expect(mockClient.get).toHaveBeenCalledWith("/get_project/1");
      expect(result).toEqual(projectData);
    });

    it("should handle Axios errors with response data", async () => {
      const axiosError = new Error("API Error");
      (axiosError as any).response = {
        status: 403,
        data: { error: "Forbidden" },
      };
      
      mockClient.get.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(getProject(options)).rejects.toThrow("API Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle Axios errors without response data", async () => {
      const axiosError = new Error("Network Error");
      (axiosError as any).response = {
        status: 500,
      };
      
      mockClient.get.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(getProject(options)).rejects.toThrow("Network Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle non-Axios errors", async () => {
      const error = new Error("Generic Error");
      
      mockClient.get.mockRejectedValueOnce(error);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(false);

      await expect(getProject(options)).rejects.toThrow("Generic Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("createTestRun", () => {
    it("should create a test run successfully", async () => {
      const payload = {
        name: "Test Run",
        description: "Automated test run",
        include_all: true,
      };

      const response = {
        id: 100,
        name: "Test Run",
        description: "Automated test run",
        suite_id: 1,
        milestone_id: null,
        assignedto_id: null,
        include_all: true,
        is_completed: false,
        completed_on: null,
        config: null,
        config_ids: [],
        passed_count: 0,
        blocked_count: 0,
        untested_count: 0,
        retest_count: 0,
        failed_count: 0,
        custom_status_count: {},
        created_on: 1609459200,
        created_by: 1,
        url: "https://example.testrail.com/index.php?/runs/view/100",
      };

      mockClient.post.mockResolvedValueOnce({ data: response });

      const result = await createTestRun(options, payload);

      expect(mockClient.post).toHaveBeenCalledWith("/add_run/1", payload);
      expect(result).toEqual(response);
    });

    it("should handle Axios errors when creating a test run", async () => {
      const payload = {
        name: "Test Run",
      };
      
      const axiosError = new Error("API Error");
      (axiosError as any).response = {
        status: 400,
        data: { error: "Bad Request" },
      };
      
      mockClient.post.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(createTestRun(options, payload)).rejects.toThrow("API Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("getTestRun", () => {
    it("should fetch test run details", async () => {
      const runId = 100;
      const response = {
        id: runId,
        name: "Test Run",
        suite_id: 1,
        description: "Automated test run",
        milestone_id: null,
        assignedto_id: null,
        include_all: true,
        is_completed: false,
        completed_on: null,
        config: null,
        config_ids: [],
        passed_count: 0,
        blocked_count: 0,
        untested_count: 0,
        retest_count: 0,
        failed_count: 0,
        custom_status_count: {},
        created_on: 1609459200,
        created_by: 1,
        url: "https://example.testrail.com/index.php?/runs/view/100",
      };

      mockClient.get.mockResolvedValueOnce({ data: response });

      const result = await getTestRun(options, runId);

      expect(mockClient.get).toHaveBeenCalledWith("/get_run/100");
      expect(result).toEqual(response);
    });

    it("should handle Axios errors when fetching a test run", async () => {
      const runId = 100;
      
      const axiosError = new Error("API Error");
      (axiosError as any).response = {
        status: 404,
        data: { error: "Not Found" },
      };
      
      mockClient.get.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(getTestRun(options, runId)).rejects.toThrow("API Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("addResultForCase", () => {
    it("should add a test result for a case", async () => {
      const runId = 100;
      const caseId = 200;
      const payload = {
        status_id: TestStatus.Passed,
        comment: "Test passed successfully",
      };

      const response = {
        id: 300,
        test_id: 500,
        status_id: TestStatus.Passed,
        comment: "Test passed successfully",
        created_on: 1609459200,
        assignedto_id: null,
        version: "",
        elapsed: "",
        defects: "",
      };

      mockClient.post.mockResolvedValueOnce({ data: response });

      const result = await addResultForCase(options, runId, caseId, payload);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/add_result_for_case/100/200",
        payload
      );
      expect(result).toEqual(response);
    });

    it("should handle 400 Bad Request errors by skipping without throwing", async () => {
      const runId = 100;
      const caseId = 999; // 存在しないケースID
      const payload = {
        status_id: TestStatus.Failed,
        comment: "Test failed",
      };
      
      const axiosError = new Error("API Error");
      (axiosError as any).response = {
        status: 400,
        data: { error: "Bad Request - Case does not exist" },
      };
      
      mockClient.post.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      // エラーをスローせずnullを返すことを検証
      const result = await addResultForCase(options, runId, caseId, payload);
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it("should handle other Axios errors when adding a test result", async () => {
      const runId = 100;
      const caseId = 200;
      const payload = {
        status_id: TestStatus.Failed,
        comment: "Test failed",
      };
      
      const axiosError = new Error("API Error");
      (axiosError as any).response = {
        status: 422,
        data: { error: "Unprocessable Entity" },
      };
      
      mockClient.post.mockRejectedValueOnce(axiosError);
      (mockedAxios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(addResultForCase(options, runId, caseId, payload)).rejects.toThrow("API Error");
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
}); 