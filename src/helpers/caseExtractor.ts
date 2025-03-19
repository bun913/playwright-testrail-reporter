import path from "path";
import type { TestCase } from "@playwright/test/reporter";

/**
 * Extract TestRail case ID from test title.
 *
 * Supports formats:
 * - "C12345 Test description"
 * - "[C12345] Test description"
 *
 * @param title The test title to extract from
 * @returns The case ID as a number, or null if not found
 */
export function extractCaseId(title: string): number | null {
	// Match "C12345" or "[C12345]" format at the beginning of the title
	const match = title.match(/^(?:\[C(\d+)\]|C(\d+))\s/);
	if (!match) {
		return null;
	}

	// Return the first matched group (either from [C...] or C... format)
	return parseInt(match[1] || match[2], 10);
}

/**
 * Extract case ID from a Playwright test.
 * Attempts to find ID in test title first, then fallbacks to file path.
 *
 * @param testInfo The Playwright test case or test title
 * @param filePath Optional file path (used when testInfo is just a title string)
 * @returns The case ID as a number, or null if not found
 */
export function extractCaseIdFromTest(
	testInfo: TestCase | string,
	filePath?: string,
): number | null {
	// Handle when testInfo is a TestCase object
	if (typeof testInfo !== "string") {
		// Try to extract from test title first
		const idFromTitle = extractCaseId(testInfo.title);
		if (idFromTitle) {
			return idFromTitle;
		}

		// Use the file path from the TestCase object
		filePath = testInfo.location?.file;
	} else {
		// When testInfo is a string (title), extract from it
		const idFromTitle = extractCaseId(testInfo);
		if (idFromTitle) {
			return idFromTitle;
		}
	}

	// If no file path available, can't extract from file
	if (!filePath) {
		return null;
	}

	// Try to extract from file path as fallback
	const fileName = path.basename(filePath, path.extname(filePath));
	const match = fileName.match(/C(\d+)/);
	return match ? parseInt(match[1], 10) : null;
}
