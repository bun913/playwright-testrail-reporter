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
 * Only extracts from test title - tests without IDs are skipped.
 *
 * @param title The test title
 * @returns The case ID as a number, or null if not found
 */
export function extractCaseIdFromTest(title: string): number | null {
	// Extract from test title only
	// Tests without TestRail IDs should be skipped
	return extractCaseId(title);
}
