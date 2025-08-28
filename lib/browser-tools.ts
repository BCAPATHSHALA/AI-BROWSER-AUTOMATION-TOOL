import { tool } from "@openai/agents";
import { z } from "zod";
import { BrowserAutomationEngine } from "./browser-automation";
import type { AutomationResult } from "./browser-automation";

/*
 * Browser Automation Tools
 * Agents: createBrowserNavigationAgent, createFormAutomationAgent, createDataExtractionAgent, createGatewayAgent
 * Note: These tools that uses the playwright methods for a particular work and tools are used by specialized agents in specialized-agents.ts
 */

const engine = new BrowserAutomationEngine();

export function createBrowserTools() {
  const takeScreenshot = tool({
    name: "take_screenshot",
    description:
      "Takes a screenshot of the current page and returns it as a base64-encoded PNG image",
    parameters: z.object({}),
    async execute(): Promise<{ screenshot: string }> {
      const screenshot = await engine.takeScreenshot();
      return { screenshot };
    },
  });

  const navigateToUrl = tool({
    name: "navigate_to_url",
    description: "Navigates the browser to a specific URL",
    parameters: z.object({
      url: z.string(),
    }),
    async execute({ url }): Promise<AutomationResult> {
      return await engine.navigate(url);
    },
  });

  const clickElement = tool({
    name: "click_element",
    description: "Clicks on an element specified by CSS selector",
    parameters: z.object({
      selector: z.string().describe("CSS selector for the element to click"),
    }),
    async execute({ selector }): Promise<AutomationResult> {
      return await engine.clickElement(selector);
    },
  });

  const fillInput = tool({
    name: "fill_input",
    description: "Fills an input field with the specified value",
    parameters: z.object({
      selector: z.string().describe("CSS selector for the input field"),
      value: z.string().describe("Value to fill in the input field"),
    }),
    async execute({ selector, value }): Promise<AutomationResult> {
      return await engine.fillInput(selector, value);
    },
  });

  const extractText = tool({
    name: "extract_text",
    description: "Extracts text content from an element",
    parameters: z.object({
      selector: z
        .string()
        .describe("CSS selector for the element to extract text from"),
    }),
    async execute({ selector }): Promise<AutomationResult> {
      return await engine.extractText(selector);
    },
  });

  const waitForElement = tool({
    name: "wait_for_element",
    description: "Waits for an element to appear on the page",
    parameters: z.object({
      selector: z.string().describe("CSS selector for the element to wait for"),
      timeout: z
        .number()
        .optional()
        .default(10000)
        .describe("Timeout in milliseconds"),
    }),
    async execute({ selector, timeout }): Promise<AutomationResult> {
      return await engine.waitForElement(selector, timeout);
    },
  });

  const findFormFields = tool({
    name: "find_form_fields",
    description: "Discovers all form fields on the current page",
    parameters: z.object({}),
    async execute(): Promise<AutomationResult> {
      return await engine.findFormFields();
    },
  });

  const findButtons = tool({
    name: "find_buttons",
    description: "Discovers all buttons on the current page",
    parameters: z.object({}),
    async execute(): Promise<AutomationResult> {
      return await engine.findButtons();
    },
  });

  const getCurrentPageInfo = tool({
    name: "get_current_page_info",
    description: "Gets information about the current page (URL, title)",
    parameters: z.object({}),
    async execute(): Promise<{ url: string; title: string }> {
      const url = await engine.getCurrentUrl();
      const title = await engine.getPageTitle();
      return { url, title };
    },
  });

  const scrollPage = tool({
    name: "scroll_page",
    description: "Scrolls the page to the specified x,y coordinates",
    parameters: z.object({
      x: z.number().describe("x axis on the screen where we need to click"),
      y: z.number().describe("y axis on the screen where we need to click"),
    }),
    async execute({ x, y }): Promise<{ x: Number; y: Number }> {
      await engine.scrollPage(x, y);
      return { x, y };
    },
  });

  const selectOption = tool({
    name: "select_option",
    description: "Selects an option from a dropdown menu",
    parameters: z.object({
      selector: z.string().describe("CSS selector for the select element"),
      value: z.string().describe("Value of the option to select"),
    }),
    async execute({
      selector,
      value,
    }): Promise<{ selector: string; value: string }> {
      await engine.selectOption(selector, value);
      return { selector, value };
    },
  });

  const extractLinks = tool({
    name: "extract_links",
    description:
      "Extracts all links from elements matching the given CSS selector",
    parameters: z.object({
      selector: z
        .string()
        .describe("CSS selector for the elements to extract links from"),
    }),
    async execute({ selector }): Promise<{ links: string[] }> {
      const links = await engine.extractLinks(selector);
      return { links };
    },
  });

  return {
    takeScreenshot,
    navigateToUrl,
    clickElement,
    fillInput,
    extractText,
    waitForElement,
    findFormFields,
    findButtons,
    getCurrentPageInfo,
    scrollPage,
    selectOption,
    extractLinks,
  };
}
