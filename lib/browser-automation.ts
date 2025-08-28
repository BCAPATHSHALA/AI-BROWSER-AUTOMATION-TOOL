import {
  chromium,
  type Browser,
  type Page,
  type BrowserContext,
} from "playwright";

/*
 * Browser Automation Engine
 * This class encapsulates the Playwright browser automation logic.
 * It provides methods to initialize the browser, navigate to URLs, interact with page elements,
 * take screenshots, and extract information from web pages.
 * The engine is designed to be used by AI agents to perform automated web browsing tasks.
 * Currently, it supports 13 core actions.
 * Actions: initialize, navigate, takeScreenshot, clickElement, fillInput, extractText, waitForElement, findFormFields, findButtons, getCurrentUrl, getPageTitle, close, scrollPage, selectOption, extractLinks
 * Each method returns a structured result indicating success or failure, along with relevant data or error messages.
 * Note: these actions are used by tools defined in browser-tools.ts
 */

export interface BrowserAutomationOptions {
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
}

export interface AutomationStep {
  id: string;
  type:
    | "navigate"
    | "click"
    | "fill"
    | "screenshot"
    | "wait"
    | "extract"
    | "scroll"
    | "select"
    | "findLinks";
  description: string;
  selector?: string;
  value?: string;
  url?: string;
  timeout?: number;
}

export interface AutomationResult {
  success: boolean;
  message: string;
  screenshot?: string;
  data?: any;
  error?: string;
}

// Class to manage browser automation using Playwright
export class BrowserAutomationEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private options: BrowserAutomationOptions;

  constructor(options: BrowserAutomationOptions = {}) {
    this.options = {
      headless: false,
      timeout: 30000,
      viewport: { width: 1280, height: 720 },
      ...options,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: this.options.headless,
        args: [
          "--disable-extensions",
          "--disable-file-system",
          "--no-sandbox",
          "--disable-setuid-sandbox",
        ],
      });

      this.context = await this.browser.newContext({
        viewport: this.options.viewport,
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.options.timeout!);

      // Set up console logging
      this.page.on("console", (msg) => {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
      });

      // Set up error handling
      this.page.on("pageerror", (error) => {
        console.error(`[Browser Error] ${error.message}`);
      });
    } catch (error) {
      throw new Error(`Failed to initialize browser: ${error}`);
    }
  }

  async navigate(url: string): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.goto(url, { waitUntil: "networkidle" });
      const title = await this.page.title();

      return {
        success: true,
        message: `Successfully navigated to ${url}`,
        data: { url, title },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to navigate to ${url}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      // const screenshot = await this.page.screenshot({
      //   type: "png",
      //   fullPage: true,
      //   path: `screenshot_${Date.now()}.png`,
      // });
      const form = this.page.locator("form");
      if ((await form.count()) > 0) {
        await form.evaluate((f) => f.scrollIntoView());
      } else {
        await this.page.evaluate(() => window.scrollTo(0, 0));
      }
      const screenshot = form.screenshot({
        type: "png",
        path: `screenshot_${Date.now()}.png`,
      });
      const screenshotBuffer = await screenshot;
      const screenshotBase64 = screenshotBuffer.toString("base64");
      // Todo: save image into cloudinary and return the url instead of base64 due to avoid the token limit issue & save LLM token usage
      // const screenshotBase64 = screenshot.toString("base64");
      // console.log("Screenshot in base64 format:", screenshotBase64);
      // return `data:image/png;base64,${screenshotBase64}`;
      return "data:image/png;base64," + `${screenshotBase64}`;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }

  async clickElement(selector: string): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.click(selector);

      return {
        success: true,
        message: `Successfully clicked element: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to click element: ${selector}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async fillInput(selector: string, value: string): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.fill(selector, value);

      return {
        success: true,
        message: `Successfully filled input ${selector} with: ${value}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fill input: ${selector}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async extractText(selector: string): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      const text = await this.page.textContent(selector);

      return {
        success: true,
        message: `Successfully extracted text from: ${selector}`,
        data: { text },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to extract text from: ${selector}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async waitForElement(
    selector: string,
    timeout = 10000
  ): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.waitForSelector(selector, { timeout });

      return {
        success: true,
        message: `Element appeared: ${selector}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Element did not appear: ${selector}`,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async findFormFields(): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      const formFields = await this.page.evaluate(() => {
        const inputs = Array.from(
          document.querySelectorAll("input, textarea, select")
        );
        return inputs.map((input) => {
          const el = input as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement;
          return {
            tagName: el.tagName.toLowerCase(),
            type: el.getAttribute("type") || "text",
            name: el.name || "",
            id: el.id || "",
            placeholder: el.getAttribute("placeholder") || "",
            required: el.hasAttribute("required"),
            selector: el.id
              ? `#${el.id}`
              : el.name
              ? `[name="${el.name}"]`
              : "",
          };
        });
      });

      return {
        success: true,
        message: `Found ${formFields.length} form fields`,
        data: { formFields },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to find form fields",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async findButtons(): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      const buttons = await this.page.evaluate(() => {
        const buttonElements = Array.from(
          document.querySelectorAll(
            'button, input[type="submit"], input[type="button"]'
          )
        );
        return buttonElements.map((button) => ({
          tagName: button.tagName.toLowerCase(),
          type: button.getAttribute("type") || "button",
          text: button.textContent?.trim() || "",
          id: button.getAttribute("id") || "",
          className: button.getAttribute("class") || "",
          selector: button.id
            ? `#${button.id}`
            : `button:has-text("${button.textContent?.trim()}")`,
        }));
      });

      return {
        success: true,
        message: `Found ${buttons.length} buttons`,
        data: { buttons },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to find buttons",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getCurrentUrl(): Promise<string> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }
    return this.page.title();
  }

  async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error("Error closing browser:", error);
    }
  }

  async scrollPage(x: number, y: number): Promise<void> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }
    await this.page.evaluate(
      ([scrollX, scrollY]) => {
        window.scrollBy(scrollX, scrollY);
      },
      [x, y]
    );
  }

  async selectOption(selector: string, value: string): Promise<void> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }
    await this.page.selectOption(selector, value);
  }

  async extractLinks(selector: string): Promise<string[]> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }
    return await this.page.$$eval(selector, (elements) =>
      elements
        .map((el) => (el as HTMLAnchorElement).href)
        .filter((href) => href)
    );
  }

  isInitialized(): boolean {
    return this.browser !== null && this.page !== null;
  }
}
