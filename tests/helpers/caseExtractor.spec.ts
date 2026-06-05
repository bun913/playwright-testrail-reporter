import { describe, it, expect } from "vitest";
import {
  extractCaseId,
  extractCaseIdFromTest,
  extractCaseIds,
  extractCaseIdsFromTest,
} from "../../src/helpers/caseExtractor";

describe("caseExtractor", () => {
  describe("extractCaseId (deprecated)", () => {
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

    it("should return only the first ID when multiple IDs are present", () => {
      expect(extractCaseId("C111 C222 Multi-ID test")).toBe(111);
    });
  });

  describe("extractCaseIdFromTest (deprecated)", () => {
    it("should extract case ID from test title with C format", () => {
      const result = extractCaseIdFromTest("C11111 delete a user with tenant");
      expect(result).toBe(11111);
    });

    it("should extract case ID from test title with [C] format", () => {
      const result = extractCaseIdFromTest("[C99999] create a user");
      expect(result).toBe(99999);
    });

    it("should return null for test title without case ID", () => {
      const result = extractCaseIdFromTest("create a user without special settings");
      expect(result).toBeNull();
    });

    it("should return null for test title with case ID not at beginning", () => {
      const result = extractCaseIdFromTest("deletes a user with tenant C12345");
      expect(result).toBeNull();
    });
  });

  describe("extractCaseIds", () => {
    it("should extract a single C-format ID", () => {
      expect(extractCaseIds("C12345 Single ID test")).toEqual([12345]);
    });

    it("should extract a single bracketed ID", () => {
      expect(extractCaseIds("[C12345] Single ID test")).toEqual([12345]);
    });

    it("should extract multiple consecutive C-format IDs", () => {
      expect(extractCaseIds("C165393 C165376 Verify: empty state when group has no members")).toEqual([165393, 165376]);
    });

    it("should extract multiple consecutive bracketed IDs", () => {
      expect(extractCaseIds("[C111] [C222] Some test description")).toEqual([111, 222]);
    });

    it("should extract mixed C-format and bracketed IDs", () => {
      expect(extractCaseIds("C111 [C222] Mixed formats test")).toEqual([111, 222]);
    });

    it("should extract three or more IDs", () => {
      expect(extractCaseIds("C1 C2 C3 Three IDs test")).toEqual([1, 2, 3]);
    });

    it("should return empty array when no IDs present", () => {
      expect(extractCaseIds("No ID here")).toEqual([]);
    });

    it("should return empty array for empty string", () => {
      expect(extractCaseIds("")).toEqual([]);
    });

    it("should not extract IDs that appear in the middle of a title", () => {
      expect(extractCaseIds("Some test C12345 in the middle")).toEqual([]);
    });
  });

  describe("extractCaseIdsFromTest", () => {
    it("should delegate to extractCaseIds and return all case IDs", () => {
      expect(extractCaseIdsFromTest("C165393 C165376 Verify: empty state when group has no members")).toEqual([165393, 165376]);
    });

    it("should return empty array for test title without case ID", () => {
      expect(extractCaseIdsFromTest("create a user without special settings")).toEqual([]);
    });
  });
});
