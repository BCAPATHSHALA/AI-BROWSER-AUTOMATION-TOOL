# 🤖 AI Agent for Browser Automation

An AI-powered agent that can explore, interact with, and fill forms on websites using **Playwright** under the hood. It ensures safe, reliable, and explainable automation while preventing destructive actions (like auto-submitting forms without confirmation).

Built with **Next.js + Node.js + pnpm**, OpenAI’s `@openai/agents`, and custom Playwright engine.

## 🚀 Features

- Initialize and control Playwright browser sessions
- Navigate to any website and interact with forms, buttons, dropdowns
- Discover contact forms, signup forms, and feedback forms intelligently
- Take screenshots after each step (stored via Cloudinary)
- Strict rules for **form interaction** (no accidental submission, handle missing fields, etc.)
- Structured logs for every automation step

## ⚙️ Environment & Setup

Create a `.env` (or your environment variables) with at least:

```env
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=development
```

Install & run:

## 📦 Installation

```bash
git clone https://github.com/BCAPATHSHALA/AI-BROWSER-AUTOMATION-TOOL.git
cd AI-BROWSER-AUTOMATION-TOOL
pnpm install
```

Start the project:

```bash
pnpm dev
```

## 🛠️ Browser Automation Tools

All tools are defined in `createBrowserTools()` and powered by `BrowserAutomationEngine` (Playwright wrapper).

| Tool                    | Description                                             |
| ----------------------- | ------------------------------------------------------- |
| `initialize_browser`    | Starts a Playwright session (must be called first)      |
| `take_screenshot`       | Captures screenshot of current page (returns URL from ) |
| `navigate_to_url`       | Navigates to a given URL                                |
| `click_element`         | Clicks an element by CSS selector                       |
| `fill_input`            | Fills input field with given value                      |
| `extract_text`          | Extracts inner text from an element                     |
| `wait_for_element`      | Waits for an element by selector                        |
| `find_form_fields`      | Discovers form fields on the page                       |
| `find_buttons`          | Discovers clickable buttons                             |
| `get_current_page_info` | Returns current URL + title                             |
| `scroll_page`           | Scrolls to specific coordinates                         |
| `select_option`         | Selects an option from dropdown                         |
| `extract_links`         | Extracts links from given selector                      |
| `close_browser`         | Closes browser session                                  |
| `find_contact_form`     | Locates contact/support/feedback form                   |

## 🧭 WEBSITE_AUTOMATION_AGENT Rules

### 🔑 High Level Responsibilities

1. Always `initialize_browser` before any action.
2. After each step, call `take_screenshot`.
3. Discover forms using multiple strategies (selectors → attributes → semantic search → DOM scoring).
4. Do not submit unless explicitly requested.
5. If step fails, log error + screenshot and return structured report.

### 🔄 Sequencing

1. `initialize_browser`
2. `navigate_to_url` → `take_screenshot`
3. `wait_for_element` / `find_form_fields`
4. Interact (`fill_input`, `click_element`, `select_option`) → `take_screenshot`
5. `close_browser` on completion or fatal error

### 📑 Form Interaction Rules

- Always run `find_form_fields` first
- If any **required field is missing**, **STOP immediately** → return missing fields in `finalOutput`, close browser
- Map user fields (name, email, message, password) → discovered fields by label/id/placeholder
- If ambiguous, prefer `email > name > message`
- If user did **not** say "submit", STOP after filling, return status
- If user explicitly said "submit", then click submit → take screenshot → return success/failure + redirect URL + page title
- If user unclear about forms, list all discovered forms with required fields and STOP

### 🖼 Screenshot Policy

- Screenshot after every step
- Screenshot before cleanup on failure
- No secret/sensitive values (passwords, emails) should appear in screenshots

### 🛡️ Safety & Constraints

- No paywall bypassing
- No stolen credentials
- No leaking API keys/secrets
- If OTP/authentication required → STOP with message

## 🧪 Test Cases & Edge Cases

### ✅ Test Case 1: Form discovery (without submission)

```
Go to https://ui.chaicode.com/auth-sada/signup and fill the contact form with:
- Name: Manoj Kumar
- Email: manojnishad@gmail.com
- Password: mybrowser@tdl
Do not submit the form yet
```

**Expected:** Form is filled, screenshots returned, no submission.

---

### ✅ Test Case 2: Explicit submission

```
Go to https://ui.chaicode.com/auth-sada/signup and fill the contact form with:
- Name: Manoj Kumar
- Email: manojnishad@gmail.com
- Password: mybrowser@tdl
Then submit the form
```

**Expected:** Form is filled, submitted, screenshot of success/failure shown.

---

### ✅ Test Case 3: Fallback discovery (no clear contact form)

```
Visit https://ui.chaicode.com and try to locate any signup, contact or feedback
form. If found then fill it with:
- Name: Manoj Kumar
- Email: manojnishad@gmail.com
- Password: mybrowser@tdl
Do not submit
```

**Expected:** Best candidate form discovered using fallback rules. Filled, not submitted.

---

### ✅ Test Case 4: Edge case (user not clear about submission)

```
Open https://ui.chaicode.com/auth-sada/signup and fill the form with:
- Name: Manoj Kumar
- Email: manojnishad@gmail.com
- Password: mybrowser@tdl
```

**Expected:** Agent fills but does not submit (since submission was not explicitly mentioned).

## 📊 Logs & Output Format

Each tool call returns structured logs:

```json
{
  "stepId": 1,
  "tool": "navigate_to_url",
  "parameters": { "url": "https://example.com" },
  "result": "success",
  "message": "Navigated to page",
  "screenshotURL": "https://cloudinary.com/screenshot1.jpg",
  "data": { "title": "Example Site" }
}
```

Final output (human-readable example):

```plantext
I attempted to find and fill the contact form on https://example.com.
Page title: Example Site.
I found a likely contact form using selector '#contact-us' (fields: name, email, message).
I filled name and email.
I did not submit the form because you did not request submission.
Screenshot: https://.../screen_123.jpg
Next step: confirm if you want me to submit or try another page.
```
