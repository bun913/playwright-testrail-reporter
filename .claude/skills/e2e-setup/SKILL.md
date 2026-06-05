---
name: e2e-setup
description: "Prepare the TestRail demo site for this reporter's E2E run. Rotate the ptr-e2e-* API key via Playwright, provision fixtures (section + cases + run), verify access, and write .testrail-e2e.env."
allowed-tools: Bash(npm run playwright-cli:*), Bash(curl:*), Bash(npm:*), Bash(node:*), Bash(date:*), Bash(test:*)
---

# TestRail E2E Setup (playwright-testrail-reporter)

## Overview

Ensures `.testrail-e2e.env` is configured with valid TestRail demo-site credentials
**plus a real project + case ID** so that `npm run test:e2e` can run a trivial Playwright
test through THIS reporter and have the result land in TestRail.

This repo is a Playwright reporter (not an MCP server). Unlike `mcp-testrail`, the output
is a dotenv file consumed by `playwright.e2e.config.ts`, not `.mcp.json`.

Because the demo instance is periodically wiped, this skill also **provisions fixtures**
(a section, several test cases, and a TestRun containing them) so that both reporter use
cases are exercisable without depending on whatever data happens to exist:
- Use Case 1 — report into an existing run (`TESTRAIL_E2E_RUN_ID`)
- Use Case 2 — reporter creates a new run from `projectId` (+ `suiteId`)

**Output**: `.testrail-e2e.env` (git-ignored) with:

```
TESTRAIL_E2E_URL=<DEMO_SITE_URL>
TESTRAIL_E2E_USERNAME=<LOGIN_ID>
TESTRAIL_E2E_API_KEY=<GENERATED_API_KEY>
TESTRAIL_E2E_KEY_GENERATED_AT=<ISO8601>
TESTRAIL_E2E_PROJECT_ID=<picked project id>
TESTRAIL_E2E_SUITE_ID=<suite id, only if the project is multi-suite>
TESTRAIL_E2E_SECTION_ID=<section the fixture cases were added under>
TESTRAIL_E2E_CASE_IDS=<comma-separated case ids created by this skill>
TESTRAIL_E2E_RUN_ID=<run id that contains those cases>
```

## Prerequisites

- `@playwright/cli` is in `devDependencies` and available as `npm run playwright-cli`
- Chromium must be installed: `npx playwright install chromium` if needed

> Note: this repo shares the demo-site login with `mcp-testrail`. To avoid deleting each
> other's keys, this skill ONLY manages keys whose name starts with `ptr-e2e-`.

## Step 1: Check if `.testrail-e2e.env` already works

```bash
test -f .testrail-e2e.env && cat .testrail-e2e.env
```

**If it exists**, verify the credentials AND that the provisioned run still exists:

```bash
set -a; . ./.testrail-e2e.env; set +a
curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -u "$TESTRAIL_E2E_USERNAME:$TESTRAIL_E2E_API_KEY" \
  "${TESTRAIL_E2E_URL}/index.php?/api/v2/get_run/${TESTRAIL_E2E_RUN_ID}"
```

- HTTP 200 **and** `TESTRAIL_E2E_CASE_IDS` / `TESTRAIL_E2E_RUN_ID` are present -> skip to Step 6
- HTTP 400/401 or fields missing (key rotated or demo data wiped) -> continue to Step 2

## Step 2: Get latest credentials

Use `WebFetch` on this URL to extract login ID, password, and demo URL:

```
https://www.techmatrix.co.jp/product/testrail/demo_site.html
```

## Step 3: Login to TestRail via playwright-cli

All playwright-cli commands are run via `npm run playwright-cli --`.

### 3a. Open login page

```bash
npm run playwright-cli -- open '<DEMO_SITE_URL>/index.php?/auth/login'
npm run playwright-cli -- snapshot
```

### 3b. Fill login form and submit

Known selectors (as of 2026-03):
- Email: `input[name="name"]`
- Password: `input[name="password"]`
- Submit: `#button_primary`

```bash
npm run playwright-cli -- fill <email_ref> "<LOGIN_ID>"
npm run playwright-cli -- fill <password_ref> "<PASSWORD>"
npm run playwright-cli -- click <login_button_ref>
```

Verify redirect to dashboard (URL contains `/dashboard`).

### 3c. Navigate to API Keys tab

```bash
npm run playwright-cli -- goto '<DEMO_SITE_URL>/index.php?/mysettings'
npm run playwright-cli -- snapshot
```

Click the "API キー" tab. **Important**: There are two elements with text "API キー". Use the one with `data-testid="apiKeysButton"`.

## Step 4: Delete old `ptr-e2e-*` keys

Scan the API key table. For each row whose name starts with `ptr-e2e-`:
1. Click its delete icon/link
2. Handle confirmation dialog (click `.dialog-action-default` or "OK")
3. Snapshot to confirm

**Never delete keys that don't start with `ptr-e2e-`** (e.g. `mcp-e2e-*` belong to mcp-testrail).

## Step 5: Generate new API key

### 5a. Click "キーの追加" link, then snapshot.

### 5b. Fill key name (input `id="userTokenName"`) with `ptr-e2e-YYYYMMDD-HHMMSS`.

### 5c. Click "キーの生成", snapshot, and **read the generated key immediately** (shown once, as a readonly input).

### 5d. Confirm and save
1. Click "キーの追加" in the dialog to confirm
2. Click "設定の保存" on the settings page (**required**, otherwise API returns 401)

### 5e. Close browser

```bash
npm run playwright-cli -- close
```

## Step 5f: Pick a project and resolve its suite

All API calls use Basic auth `-u "$LOGIN:$KEY"` against `${DEMO_URL}/index.php?/api/v2/...`.
Set these shell vars from the values gathered above:

```bash
DEMO_URL='<DEMO_SITE_URL>'
LOGIN='<LOGIN_ID>'
KEY='<GENERATED_API_KEY>'
AUTH=(-s -u "$LOGIN:$KEY")
```

Pick the first project and detect its suite mode:

```bash
PROJECT_JSON=$(curl "${AUTH[@]}" "${DEMO_URL}/index.php?/api/v2/get_projects")
PROJECT_ID=$(node -e "const d=JSON.parse(process.argv[1]);const a=Array.isArray(d)?d:d.projects;console.log(a[0].id)" "$PROJECT_JSON")
SUITE_MODE=$(node -e "const d=JSON.parse(process.argv[1]);const a=Array.isArray(d)?d:d.projects;console.log(a[0].suite_mode)" "$PROJECT_JSON")

# suite_mode: 1 = single suite, 2 = single + baselines, 3 = multiple suites.
# get_sections / add_case require a suite_id in multi-suite mode.
SUITE_ID=""
if [ "$SUITE_MODE" = "3" ]; then
  SUITES_JSON=$(curl "${AUTH[@]}" "${DEMO_URL}/index.php?/api/v2/get_suites/${PROJECT_ID}")
  SUITE_ID=$(node -e "const d=JSON.parse(process.argv[1]);const a=Array.isArray(d)?d:d.suites;console.log(a[0].id)" "$SUITES_JSON")
fi
echo "PROJECT_ID=$PROJECT_ID SUITE_MODE=$SUITE_MODE SUITE_ID=$SUITE_ID"
```

## Step 5g: Provision fixtures (section + cases + run)

Create our own fresh data so the E2E run never depends on pre-existing demo content.

### 5g-1. Create a section

`add_section` needs `suite_id` only in multi-suite mode:

```bash
SECTION_BODY=$(node -e "const b={name:'ptr-e2e section'}; if(process.env.S) b.suite_id=Number(process.env.S); process.stdout.write(JSON.stringify(b))" )
SECTION_JSON=$(S="$SUITE_ID" curl "${AUTH[@]}" -H 'Content-Type: application/json' \
  -X POST -d "$SECTION_BODY" \
  "${DEMO_URL}/index.php?/api/v2/add_section/${PROJECT_ID}")
SECTION_ID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$SECTION_JSON")
echo "SECTION_ID=$SECTION_ID"
```

### 5g-2. Add two test cases

```bash
CASE_IDS=""
for n in 1 2; do
  CASE_JSON=$(curl "${AUTH[@]}" -H 'Content-Type: application/json' \
    -X POST -d "{\"title\":\"[ptr-e2e] smoke case ${n}\"}" \
    "${DEMO_URL}/index.php?/api/v2/add_case/${SECTION_ID}")
  CID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$CASE_JSON")
  CASE_IDS="${CASE_IDS:+$CASE_IDS,}$CID"
done
echo "CASE_IDS=$CASE_IDS"
```

### 5g-3. Create a TestRun containing exactly those cases

`add_run` takes `suite_id` only in multi-suite mode; `include_all:false` + `case_ids`
restricts the run to our fixtures:

```bash
RUN_BODY=$(CIDS="$CASE_IDS" S="$SUITE_ID" node -e "
  const ids=process.env.CIDS.split(',').map(Number);
  const b={name:'ptr-e2e run',include_all:false,case_ids:ids};
  if(process.env.S) b.suite_id=Number(process.env.S);
  process.stdout.write(JSON.stringify(b));")
RUN_JSON=$(curl "${AUTH[@]}" -H 'Content-Type: application/json' \
  -X POST -d "$RUN_BODY" \
  "${DEMO_URL}/index.php?/api/v2/add_run/${PROJECT_ID}")
RUN_ID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$RUN_JSON")
echo "RUN_ID=$RUN_ID"
```

If any POST returns an error JSON instead of an object with `id`, print the response,
fix the cause (e.g. missing `suite_id` in multi-suite mode), and retry.

## Step 5h: Write `.testrail-e2e.env`

Write the file (omit the `TESTRAIL_E2E_SUITE_ID` line if `SUITE_ID` is empty):

```
TESTRAIL_E2E_URL=<DEMO_URL>
TESTRAIL_E2E_USERNAME=<LOGIN>
TESTRAIL_E2E_API_KEY=<KEY>
TESTRAIL_E2E_KEY_GENERATED_AT=<ISO8601 now, e.g. from `date -u +%Y-%m-%dT%H:%M:%SZ`>
TESTRAIL_E2E_PROJECT_ID=<PROJECT_ID>
TESTRAIL_E2E_SUITE_ID=<SUITE_ID>
TESTRAIL_E2E_SECTION_ID=<SECTION_ID>
TESTRAIL_E2E_CASE_IDS=<CASE_IDS>
TESTRAIL_E2E_RUN_ID=<RUN_ID>
```

## Step 6: Verify end-to-end

Confirm the run exists and currently has no results yet:

```bash
set -a; . ./.testrail-e2e.env; set +a
curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -u "$TESTRAIL_E2E_USERNAME:$TESTRAIL_E2E_API_KEY" \
  "${TESTRAIL_E2E_URL}/index.php?/api/v2/get_run/${TESTRAIL_E2E_RUN_ID}"
```

- HTTP 200 -> setup complete. Tell the user they can now run `npm run build && npm run test:e2e`,
  then re-check the run in TestRail (or via `get_tests/<run_id>`) to confirm the results landed.
- Any other status -> investigate and retry.

## Key Naming Convention

All keys use prefix `ptr-e2e-YYYYMMDD-HHMMSS`. Only keys matching `ptr-e2e-*` are managed by this skill.

## Known UI Selectors (as of 2026-03)

| Element | Selector / Identifier |
|---|---|
| Login email | `input[name="name"]` |
| Login password | `input[name="password"]` |
| Login submit | `#button_primary` |
| API Keys tab | `data-testid="apiKeysButton"` (use this to avoid duplicate match) |
| Add key link | Text: "キーの追加" |
| Key name input | `id="userTokenName"` |
| Generate button | Text: "キーの生成" |
| Confirm add button | Text: "キーの追加" (in dialog) |
| Save settings button | Text: "設定の保存" |
| Delete confirm | `.dialog-action-default` |

## Self-update protocol

If any step fails due to UI changes:
1. Snapshot the current page state
2. Identify what changed
3. Update THIS skill file (especially the Known UI Selectors table)
4. Retry

## File Layout

| File | Purpose | Git tracked |
|------|---------|-------------|
| `.testrail-e2e.env` | Credentials + provisioned project/suite/section/cases/run for the E2E run | No (gitignored) |
| `.testrail-e2e.env.example` | Template documenting the required keys | Yes |

## Fixture naming

All provisioned data is prefixed `ptr-e2e` / `[ptr-e2e]` (section, cases, run) so it is
recognizable and distinct from `mcp-testrail`'s `[E2E]` data on the shared demo account.
