import { describe, it, expect } from "vitest";
import { formatErrorMessage } from "../../src/helpers/formatter";

describe("formatter", () => {
  describe("formatErrorMessage", () => {
    it("should format error with stack trace", () => {
      const error = new Error("Test error message");
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toContain("Error: Test error message");
      expect(formatted).toContain("Stack trace:");
    });

    it("should handle error without stack trace", () => {
      const error = { name: "Error", message: "Error without stack" } as Error;
      const formatted = formatErrorMessage(error);
      
      expect(formatted).toContain("Error: Error without stack");
    });

    it("should handle string error", () => {
      const formatted = formatErrorMessage("Simple error message");
      expect(formatted).toBe("Simple error message");
    });

    it("should handle null error", () => {
      const formatted = formatErrorMessage(null);
      expect(formatted).toBeUndefined();
    });

    it("should handle undefined error", () => {
      const formatted = formatErrorMessage(undefined);
      expect(formatted).toBeUndefined();
    });
  });
}); 