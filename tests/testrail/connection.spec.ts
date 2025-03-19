import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyConnection } from "../../src/testrail/connection";
import * as testrailApi from "../../src/api/testrailApi";

describe("connection", () => {
  const options = {
    testRailHost: "https://example.testrail.com",
    username: "user",
    apiKey: "key",
    projectId: 1
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe("verifyConnection", () => {
    it("should verify connection successfully", async () => {
      const mockProject = {
        id: 1,
        name: "Test Project"
      };
      
      vi.spyOn(testrailApi, "getProject").mockResolvedValue(mockProject as any);
      
      const result = await verifyConnection(options);
      
      expect(testrailApi.getProject).toHaveBeenCalledWith(options);
      expect(result).toEqual({ name: "Test Project", id: 1 });
    });
    
    it("should throw error when connection fails", async () => {
      vi.spyOn(testrailApi, "getProject").mockRejectedValue(new Error("Connection failed"));
      
      await expect(verifyConnection(options)).rejects.toThrow();
    });
  });
}); 