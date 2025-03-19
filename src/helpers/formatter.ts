import { TestError } from "@playwright/test/reporter";

/**
 * Format error message for TestRail. This function ensures that
 * error content is properly formatted for display in TestRail.
 *
 * @param error The error object or string to format
 * @returns A formatted error message, or undefined if error is null/undefined
 */
export function formatErrorMessage(
	error: Error | TestError | string | undefined | null,
): string | undefined {
	if (!error) {
		return undefined;
	}

	if (typeof error === "string") {
		return error;
	}

	// Handle Error objects
	if (error instanceof Error) {
		const message = `${error.name}: ${error.message}`;
		if (error.stack) {
			return `${message}\n\nStack trace:\n${error.stack}`;
		}
		return message;
	}

	// Handle TestError objects
	if ("message" in error) {
		const message = error.message || "Unknown error";
		if ("stack" in error && error.stack) {
			return `Error: ${message}\n\nStack trace:\n${error.stack}`;
		}
		return `Error: ${message}`;
	}

	return String(error);
}
