# Universal Excel Based Domain Specific Language for QA Automation, built on Playwright

> **Note:** This project is in early development and is not ready for personal or professional use. Because this project is being developed under MPBSDP, the original commit logs are hidden.

## Overview

This project is a **low-code, domain-specific language (DSL)** built entirely in Node.js using Playwright to enable **site-agnostic UI test automation**. It was originaly developed for one of the QA teams at the **Ministry of Public Business Service Delivery and Procurement (MPBSDP)** to empower testers to define and execute automated web tests without writing traditional code.

The DSL expresses actions and assertions using a compact syntax and can resolve inputs from Excel rows. Capabilities include semantic navigation via <`login=...;`>, modular test reuse via <`call=...`>, and two row-scoped input strategies: `grab+` (row-relative) and `grabset+` (row-absolute).

## Key Features

- **Excel-Based DSL:** Define test steps with structured syntax directly in Excel.
- **Universal Site Support:** Run tests against any website by providing a URL.
- **No Coding Required:** Use predefined syntax blocks to describe interactions.
- **Playwright Execution:** Parsed DSL actions are executed via Playwright.
- **Structured Reporting:** Results are logged to XLSX with timestamps, status, and error messages.
- **Universal Dispatcher:** Extensible mapping from DSL actions to Playwright operations.
- **Modular Test Reuse (<`call=...`>):** Compose tests by invoking named test blocks.
- **Semantic Login (<`login=...;`>):** Alias of navigate, clarifies intent when moving to auth routes.
- **Row-Scoped Input:**
  - `grab+` - **row-relative** lookup (dynamic per calling data row).
  - `grabset+` - **row-absolute** lookup (anchored/static to the grab’s origin row).

## How It Works

1. **Define Test Steps:** Write DSL steps in Excel using DSL syntax (e.g., <`click=#id;`>).
2. **Provide a Target URL:** Set the site URL in your config sheet or use <`navigate=URL;`> / <`login=URL;`>.
3. **Parse & Validate:** A Node.js interpreter reads the Excel file, validates syntax, and maps selectors via a universal dispatcher.
4. **Execute via Playwright:** The browser is launched and interactions are performed step by step.
5. **Log Results:** Detailed XLSX report is generated with pass/fail status, errors, and timestamps....
6. **Name with <`name=...`>:** Assign a test block a name so that logic can be reused later, if you do not assign a name it will default to testcase#.
7. **Compose with <`call=...`>:** Invoke a named test block from another test to reuse logic flows and share data context.
8. **Resolve Inputs with `grab+` / `grabset+`:**
   - `grab+` resolves using the **current test row** (dynamic).
   - `grabset+` resolves using the **anchor row** where the grab context was set (static across calls).

## DSL Actions (Examples & Semantics)

- **Click**
  - Syntax:
    - <`click=#loginBtn;`>
  - Description: Clicks an element by ID.

- **Type**
  - Syntax:
    - <`type=#username~hello world;`>
    - <`type=#username~grab+Usernames;`> (row-relative)
    - <`type=#username~grabset+products;`> (row-absolute)
  - Description: Types string or resolved Excel value into the specified input.

- **Select**
  - Syntax:
    - <`select=#dropdown~option+select1;`>
    - <`select=#regionDropdown~option+grab+Usernames;`>
    - <`select=#tier~option+grabset+SubscriptionTiers;`>
  - Description: Selects a dropdown option, either static or resolved from Excel.
  - Note: `select` has its own sub-action called `option+` this is so that you can select a specific option from a dropdown.

- **IsVisible**
  - Syntax:
    - <`isvisible=#banner;`>
  - Description: Checks element visibility.
  - Variant:
    - <`isvisible*=#banner;`> — checks visibility of all elements with the same ID (dispatcher-controlled).

- **Assert**
  - Syntax:
    - <`assert=#msg~hello world;`>
    - <`assert=#msg~grab+ExpectedMessage;`>
    - <`assert=#accountId~grabset+AccountID;`>
  - Description: Asserts text content of the specified selector.

- **Wait**
  - Syntax:
    - <`wait=2000;`>
  - Description: Waits in milliseconds.

- **Navigate**
  - Syntax:
    - <`navigate=https://example.com;`>
  - Description: Navigates to a URL.

- **Login (New)**
  - Syntax:
    - <`login=https://example.com/login;`>
  - Description: **Semantic alias** of `navigate`; use to clarify intent when moving to login/auth pages. The dispatcher should treat this as a `navigate` under the hood but may log the action type as `LOGIN`.

- **Screenshot**
  - Syntax:
    - <`screenshot=loginPage;`>
  - Description: Captures a browser snapshot with a given name.
  - Note: It is best practice to call a <`wait=1000`> before taking a screenshot.

- **Input**
  - Syntax:
    - <`input=hello world;`>
    - <`input=grab+OTP;`>
    - <`input=grabset+StaticToken;`>
  - Description: Simulates raw keyboard input (non-selector-targeted, interpreter-dependent).

## DSL Keywords

- **End**
  - Syntax:
    - <`end`>
  - Description: Marks the end of a test.

- **Name**
  - Syntax:
    - <`name=LoginTest;`>
  - Description: Names the test block; referenced by <`call=...`>.

- **Call**
  - Syntax:
    - <`call=TestName`>
  - Description: Invokes a predefined test block. Enables modular reuse and dynamic composition. Called tests can read dynamic data via `grab+` and fixed data via `grabset+`.

## Supported DSL SubActions

- **Type / Assert / Input** may take `grab+HeaderName` or `grabset+HeaderName` as their input sources.

  - `grab+` (**Row Relative Constraint Input**)
    - Purpose: Fetch data from the **current test row** based on the header name in Excel.
    - Syntax:
      - `grab+HeaderName`
    - Behavior: Looks up the cell value in the same row the test is executing on.
    - Example usages:
      - <`type=#username~grab+<ColumnHeader>;`>
      - <`assert=#welcomeMsg~grab+<ColumnHeader>;`>
      - <`input=grab+<ColumnHeader>;`>
      - <`select=#regionDropdown~option+grab+<ColumnHeader>;`>

  - `grabset+` (**Row Absolute Constraint Input**)
    - Purpose: Fetch data from the **anchor row** where the grab was set or established, allowing static or anchored values even in nested calls.
    - Syntax:
      - `grabset+HeaderName`
    - Behavior: Resolves from the row that **first** set the grab context (not the current row), unless re-anchored explicitly.
    - Example usages:
      - <`type=#sessionOwner~grabset+OwnerEmail;`>
      - <`assert=#accountId~grabset+AccountID;`>
      - <`input=grabset+StaticToken;`>
      - <`select=#tier~grabset+SubscriptionTier;`>

## Examples


===== Common Login Test Definition(uses login) =====

| ExecStep#1                         | Category Type | ExecStep#2                           | Names | ExecStep#3                  |
|------------------------------------|---------------|---------------------------------------|-------|-----------------------------|
| name=login;                  |               | login=https://qa.direct.health.gov.on.ca/login;click=#btnLogin;     |   |   end                          |


===== Common Test Reuse (name & call)) =====
- Note: The example below describes the reuse of a predefined test. This test will carryout the logic from the above example `login` before carrying out the steps defined under `dropdown_selection`.

| ExecStep#1                         | Category Type | ExecStep#2                           | Names | ExecStep#3                  |
|------------------------------------|---------------|---------------------------------------|-------|-----------------------------|
| name=dropdown_selection;call=login;                  |               | click=#btnCreateSubmission;     |   |   end                          |


===== Environment Switcher (uses grabset+ for static data) =====
- Note: Names=global anchors grabset+ so EnvironmentName is resolved from the anchor row, not the call site. I this case `grabset+` will always return `OTC` no matter where its called from. 


| ExecStep#1                               | Category Type | ExecStep#2                                      | Names | ExecStep#3 |
|------------------------------------------|---------------|-------------------------------------------------|-------|-----------|
| name=input-grabset;call=login;       | OTC           | type=#searchInput~grabset+Category Type;       |       | end       |
| name=grabSetTest;call=input-grabset-dev; |               | end                                             |       |        |


===== Modular Provisioning Flow (composes with call, grabset+) =====
- Note: grab+ resolves by the current row (e.g., Category Type = Product Sub for row 1). I this case `grab+` will always return what ever row data is in the same row as it was called from(e.g. when you run the test named `input-grab-dev` it will pass in `Product Sub` but if we run `grabTest` it will pass in `Drug Sub`) 


| ExecStep#1                               | Category Type | ExecStep#2                                      | Names | ExecStep#3 |
|------------------------------------------|---------------|-------------------------------------------------|-------|-----------|
| name=input-grab;call=login;          | Product Sub   | type=#searchInput~grab+Category Type;          | mich  | end       |
| name=grabTest;call=input-grab-dev;       | Drug Sub      | end                                             |       |        |

## Row-Relative vs Row-Absolute Quick Reference

- Use `grab+HeaderName` to pull values from **the row that triggered the test** (dynamic per data row).
- Use `grabset+HeaderName` to pull values from **the anchor row where the grab was set** (static across calls).
- When using <`call=...`>, prefer `grab+` for per-row variability; use `grabset+` for global/static anchors (e.g., environment, default role).

## Architecture

- **Universal Dispatcher:** Maps DSL actions to Playwright operations. Example conceptual mappings:
  - <`navigate=URL;`> → `dispatcher.navigate(URL)`
  - <`login=URL;`> → `dispatcher.navigate(URL)` (logged as `LOGIN`)
  - <`click=selector;`> → `dispatcher.click(selector)`
  - <`type=selector~value;`> → `dispatcher.type(selector, value)`
  - <`select=selector~value;`> → `dispatcher.select(selector, value)`
  - <`assert=selector~value;`> → `dispatcher.assertText(selector, value)`
  - <`screenshot=name;`> → `dispatcher.screenshot(name)`
  - <`wait=ms;`> → `dispatcher.wait(ms)`

- **DSL Initializer:** Loads and tests into the test explorer; binds to <`name=...;`> or defaults to test index/case# e.g. testCase_#.

- **Call Mechanism:** <`call=TestName`> takes the raw logic parsed inside the interpreter and adds that logic in place of the `call` key word. 
- Data resolution:
  - `grab+` → resolves as `(currentRow, header) → value`.
  - `grabset+` → resolves as `(anchorRow, header) → value` where `anchorRow` is the first row to establish the grab context.

- **Reporting Module:** Logs step-level results with action types (including `LOGIN`), timestamps, pass/fail, error messages, and screenshots...

## Future Enhancements

- **Test Compiling:** Convert DSL blocks into compiled artifacts for faster execution, caching, and static validation.
