import { describe, it, expect } from "vitest";
import { extractCaseId } from "../../src/helpers/caseExtractor";

describe("caseExtractor", () => {
  describe("extractCaseId", () => {
    it("should extract case ID from format: C12345 Description", () => {
      const result = extractCaseId("C12345 This is a test");
      expect(result).toBe(12345);
    });

    it("should extract case ID from format: [C12345] Description", () => {
      const result = extractCaseId("[C12345] This is a test");
      expect(result).toBe(12345);
    });

    it("should return null for title without case ID", () => {
      const result = extractCaseId("This is a test without ID");
      expect(result).toBeNull();
    });

    it("should return null when no case ID is present", () => {
      expect(extractCaseId("No case ID here")).toBeNull();
    });

    it("should return null when case ID is not at the beginning", () => {
      expect(extractCaseId("This has C12345 in the middle")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(extractCaseId("")).toBeNull();
    });
  });
}); 