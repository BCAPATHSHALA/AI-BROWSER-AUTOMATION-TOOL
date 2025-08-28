import { Agent, Runner } from "@openai/agents";
import { createBrowserTools } from "./browser-tools";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { SYSTEMPROMPTS } from "./system-prompts";

/*
 * Specialized Agents
 * Browser Navigation Agent - Specialized for web navigation and interaction
 * Form Automation Agent - Specialized for form filling and data entry
 * Data Extraction Agent - Specialized for scraping and extracting information
 * Gateway Agent - Routes tasks to specialized agents
 * Note: These agents are used by API routes
 */

// Browser Navigation Agent - Specialized for web navigation and interaction
const createBrowserNavigationAgent = () => {
  const browserTools = createBrowserTools();
  const {
    initializeBrowser,
    takeScreenshot,
    navigateToUrl,
    clickElement,
    waitForElement,
    scrollPage,
    closeBrowser,
  } = browserTools;

  return new Agent({
    name: "Browser Navigation Agent",
    tools: [
      initializeBrowser,
      takeScreenshot,
      navigateToUrl,
      clickElement,
      waitForElement,
      scrollPage,
      closeBrowser,
    ],
    instructions: `${SYSTEMPROMPTS.BROWSER_NAVIGATION_AGENT}`,
  });
};

// Form Automation Agent - Specialized for form filling and data entry
const createFormAutomationAgent = () => {
  const browserTools = createBrowserTools();
  const {
    initializeBrowser,
    takeScreenshot,
    fillInput,
    selectOption,
    clickElement,
    findFormFields,
    findButtons,
    closeBrowser,
    findContactForm,
  } = browserTools;

  return new Agent({
    name: "Form Automation Agent",
    tools: [
      initializeBrowser,
      takeScreenshot,
      fillInput,
      selectOption,
      clickElement,
      findFormFields,
      findButtons,
      closeBrowser,
      findContactForm,
    ],
    instructions: ` ${SYSTEMPROMPTS.FORM_AUTOMATION_AGENT}`,
  });
};

// Data Extraction Agent - Specialized for scraping and extracting information
const createDataExtractionAgent = () => {
  const browserTools = createBrowserTools();
  const {
    initializeBrowser,
    takeScreenshot,
    extractText,
    extractLinks,
    waitForElement,
    scrollPage,
    closeBrowser,
  } = browserTools;

  return new Agent({
    name: "Data Extraction Agent",
    tools: [
      initializeBrowser,
      takeScreenshot,
      extractText,
      extractLinks,
      waitForElement,
      scrollPage,
      closeBrowser,
    ],
    instructions: `${SYSTEMPROMPTS.DATA_EXTRACTION_AGENT}`,
  });
};

// Gateway Agent - Routes tasks to specialized agents
const createGatewayAgent = () => {
  const navigationAgent = createBrowserNavigationAgent();
  const formAgent = createFormAutomationAgent();
  const extractionAgent = createDataExtractionAgent();

  return Agent.create({
    name: "Browser Automation Gateway",
    handoffs: [navigationAgent, formAgent, extractionAgent],
    instructions: `
    ${RECOMMENDED_PROMPT_PREFIX} ${SYSTEMPROMPTS.GATEWAY_AGENT}`,
  });
};

// AI-AGENT for Running
const runner = new Runner({
  model: "gpt-4o-mini",
});

export const chatWithAgent = async ({
  userQuery,
}: {
  userQuery: string;
}): Promise<{ history: any; lastAgent?: string; finalOutput: any }> => {
  const agent = createGatewayAgent();
  const result = await runner.run(agent, userQuery);
  const aiResponse = {
    history: result.history,
    lastAgent: result.lastAgent?.name,
    finalOutput: result.finalOutput,
  };
  return aiResponse;
};
