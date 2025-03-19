import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  findExistingTestRun, 
  createNewTestRun, 
  createOrFindTestRun 
} from "../../src/testrail/testRun";
import * as testrailApi from "../../src/api/testrailApi";

describe("testRun", () => {
  const options = {
    testRailHost: "https://example.testrail.com",
    username: "user",
    apiKey: "key",
    projectId: 1,
    testRunId: 100
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("findExistingTestRun", () => {
    it("should find an existing test run by ID", async () => {
      const mockTestRun = { id: 100, name: "Existing Run" };
      
      // テストランの取得をモック
      vi.spyOn(testrailApi, "getTestRun").mockResolvedValue(mockTestRun as any);
      
      const result = await findExistingTestRun(options, 100);
      
      expect(testrailApi.getTestRun).toHaveBeenCalledWith(options, 100);
      expect(result).toBe(100);
    });

    it("should throw error when test run not found", async () => {
      // エラーをスローするようにモック
      vi.spyOn(testrailApi, "getTestRun").mockRejectedValue(new Error("Not found"));
      
      await expect(findExistingTestRun(options, 999)).rejects.toThrow();
    });
  });

  describe("createNewTestRun", () => {
    it("should create a new test run", async () => {
      const mockTestRun = { id: 200, name: "New Run" };
      
      // テストラン作成をモック
      vi.spyOn(testrailApi, "createTestRun").mockResolvedValue(mockTestRun as any);
      
      const result = await createNewTestRun(options, [1, 2, 3]);
      
      expect(testrailApi.createTestRun).toHaveBeenCalled();
      expect(result).toBe(200);
    });
  });

  describe("createOrFindTestRun", () => {
    it("should find existing run when testRunId is provided", async () => {
      const mockTestRun = { id: 100, name: "Existing Run" };
      
      vi.spyOn(testrailApi, "getTestRun").mockResolvedValue(mockTestRun as any);
      
      const result = await createOrFindTestRun(options, [1, 2, 3]);
      
      expect(testrailApi.getTestRun).toHaveBeenCalled();
      expect(result).toBe(100);
    });

    it("should create new run when testRunId is not provided", async () => {
      const optionsWithoutRunId = { ...options, testRunId: undefined };
      const mockTestRun = { id: 200, name: "New Run" };
      
      vi.spyOn(testrailApi, "createTestRun").mockResolvedValue(mockTestRun as any);
      
      const result = await createOrFindTestRun(optionsWithoutRunId, [1, 2, 3]);
      
      expect(testrailApi.createTestRun).toHaveBeenCalled();
      expect(result).toBe(200);
    });
  });
}); 