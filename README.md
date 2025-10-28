# Universal Excel Based Domain Specific Language for QA Automation, built on Playwright

> **Note:** This project is still in early development and is not ready for personal or proffesional use.  

## Overview

This project is a **low-code, domain-specific language (DSL)** built entirely in Node.js using playwright to enable **site-agnostic UI test automation**. I am developing this program at the behest of my QA team at the **Ministry of Public Business Service Delivery and Procurement (MPBSDP)** to empower QA testers, to define and execute automated web tests without writing traditional code.

## Key Features

- **Excel Based DSL**: Define test steps using structured syntax directly in Excel.
- **Universal Site Support**: Run tests against any website by simply providing a URL.
- **No Coding Required**: Use predefined syntax blocks to describe interactions.
- **Playwright Execution**: DSL is parsed and executed via Playwright.
- **Structured Reporting**: Results are logged to CSV/XLSX with timestamps, status, and error messages.
- **Universal Dispatcher**: Actions are defined in the universal dispatcher which is highly extensible.

## How It Works

1. **Define Test Steps**: Write test logic in Excel using DSL syntax like `<click=#id;>` or `<type=#id~my input;>`.
2. **Provide a Target URL**: Specify the site URL in your config sheet.
3. **Parse & Validate**: A Node.js interpreter reads the Excel file, validates syntax, and maps selectors via the universal dispatcher.
4. **Execute via Playwright**: The browser is launched and interactions are performed step by step.
5. **Log Results**: A detailed CSV/XLSX report is generated with pass/fail status, errors, and timestamps.

## DSL Actions

| Action      | Syntax Example                                | Description                  |
|-------------|-----------------------------------------------|------------------------------|
| `Click`     | `<click=#loginBtn;>`                          | Clicks an element by ID      |
| `Type`      | `<type=#username~hello world>`                | Types string into specified input |
| `Select`    | `<select=#dropdown~option+ColumnHeader*cell>` | Selects dropdown option      |
| `IsVisible` | `<isvisible=#banner;>`                        | Checks visibility            |
| `IsVisible*` | `<isvisible=#banner;>`                        | Checks visibility of all elements with that same ID           |
| `Assert`    | `<assert=#msg~hello world;>`                  | Asserts text content         |
| `Wait`      | `<wait=2000;>`                                | Waits in milliseconds        |
| `Navigate`  | `<navigate=https://example.com;>`             | Navigates to URL             |
| `Screenshot`| `<screenshot=loginPage;>`                     | Captures browser snapshot    |
| `Input`     | `<input=hello world;>`                        | Simulates keyboard input     |

## DSL Key Words 

| Key word      | Syntax Example                                | Description               |
|---------------|-----------------------------------------------|---------------------------|
| `End`         | `<end>`                                       | Marks end of test         |
| `Name`        | `<name=LoginTest;>`                           | Names the test            |

## Supported DSL SubActions 

| Action      | Syntax Example                                | Description              |
|-------------|-----------------------------------------------|--------------------------|
| `Type`      | `<type=#username~pass+columnHeader*cell>`     | Types input from Excel   |
| `Assert`    | `<assert=#msg~pass+columnHeader*cell;>`       | Asserts text content     |
| `Input`     | `<input=pass+columnHeader*cell;>`             | Simulates keyboard input |

## Architecture

- **Universal Dispatcher**: Maps DSL actions to Playwright based dictionary.
- **DSL initializer**: Loads tests into the test explorer.
- **Reporting Module**: Logs test results with detailed metadata.

## Future Enhancements

- Test Compiling

## Built At

This project is very much a work in progress and is being developed during my co-op term for the **Ministry of Public Business Service Delivery and Procurement (MPBSDP)** as part of a team goal to streamline the automation test creation process.
