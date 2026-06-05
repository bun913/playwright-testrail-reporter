import { test, expect } from "@playwright/test";

// 1 + 1 -> reported to a SINGLE TestRail case.
test("C2396 one plus one", async () => {
	expect(1 + 1).toBe(2);
});
