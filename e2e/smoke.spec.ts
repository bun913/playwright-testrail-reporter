import { test, expect } from "@playwright/test";

// Case IDs are the fixtures provisioned by /e2e-setup (see .testrail-e2e.env).
// They are embedded directly in the titles so the reporter can extract them.

// 1 + 1 -> reported to a SINGLE TestRail case.
test("C2396 one plus one", async () => {
	expect(1 + 1).toBe(2);
});

// 1 + 2 -> reported to MULTIPLE TestRail cases (exercises multi case-id support).
test("C2396 C2397 one plus two", async () => {
	expect(1 + 2).toBe(3);
});
