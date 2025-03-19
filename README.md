# Playwright TestRail Reporter

## Overview

This project is a custom reporter for Playwright that integrates test results directly with TestRail. It enables automatic updating of test results in TestRail based on the outcomes of Playwright test runs.

## Use Cases

The reporter supports two primary use cases:

### Use Case 1: Report to an Existing TestRun

When a specific TestRun already exists in TestRail, this reporter:
- Extracts TestRail case IDs from Playwright test titles
- Finds matching test cases within the specified TestRun
- Updates those test cases with the results from Playwright

**Required Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `testRailHost` | string | URL of your TestRail instance |
| `projectId` | number | TestRail project identifier |
| `testRunId` | number | ID of the existing TestRun to update |

### Use Case 2: Create a New TestRun and Report Results

When no specific TestRun is provided, this reporter:
- Creates a new TestRun in TestRail
- Identifies test cases with IDs in their titles
- Maps Playwright test results to corresponding TestRail cases
- Updates the newly created TestRun with these results

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `testRailHost` | string | Yes | URL of your TestRail instance |
| `projectId` | number | Yes | TestRail project identifier |
| `suiteId` | number | Maybe* | TestRail suite identifier - required if your project uses multiple test suites |
| `milestoneId` | number | No | TestRail milestone to associate with the new TestRun |

*Note: `suiteId` is required when creating a new test run in TestRail projects that use multiple test suites mode. For single suite projects, this parameter may be optional.

## Implementation Details

The reporter works by parsing Playwright test titles to extract TestRail case IDs. When a test completes, it sends the result to TestRail, mapping Playwright test statuses to TestRail result statuses.

For tests with matching TestRail case IDs, results will be automatically reported to the specified TestRun (or to a newly created TestRun if none is specified).

### Test Title Format

Your test titles should include the TestRail case ID in one of these formats:
- "C12345 Your test description"
- "[C12345] Your test description"

## Getting Started

### Installation

```bash
npm install --save-dev testrail-playwright
```

### Configuration

Configure the TestRail reporter in your Playwright configuration file:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    [
      'testrail-playwright',
      {
        // TestRail connection details
        testRailHost: 'https://example.testrail.com',
        username: 'your-username',
        apiKey: process.env.TESTRAIL_API_KEY, // Use environment variable for sensitive data
        
        // Project information
        projectId: 123,
        
        // Use Case 1: Updating an existing TestRun
        testRunId: 456,
        
        // OR Use Case 2: Creating a new TestRun
        // suiteId: 789, // Required if your project uses multiple test suites
        // milestoneId: 101, // Optional: associate with a milestone
      }
    ]
  ],
});
```

### Authentication

For security reasons, it's recommended to store your TestRail API key in an environment variable:

```
# .env file
TESTRAIL_API_KEY=your-api-key-here
```

## Troubleshooting

### Common Issues

1. **"Field :suite_id is a required field" Error**
   
   When creating a new test run, you might encounter an error if your TestRail project uses multiple test suites mode but you haven't provided a `suiteId`. Add the `suiteId` parameter to your configuration to resolve this issue.

2. **Warning Messages**

   The reporter will output warning messages to help diagnose configuration issues:
   
   - "Creating a new test run without suiteId or milestone..."
   - "Creating a new test run with suiteId but without milestone association."
   - "Creating a new test run with milestone, but no suiteId provided..."
   
   These warnings indicate how the TestRail run will be created and whether required parameters might be missing.