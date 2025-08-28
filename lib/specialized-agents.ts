import { Agent, Runner } from "@openai/agents";
import { createBrowserTools } from "./browser-tools";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

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
    ],
    instructions: `
      You are a specialized browser navigation agent focused on web page navigation and basic interactions.
      
      Your Responsibilities:
      1. Navigate to websites and web pages accurately
      2. Take screenshots to document navigation progress
      3. Click on elements like buttons, links, and interactive components
      4. Wait for page elements to load properly
      5. Scroll through pages to access content
      
      Important Guidelines:
      - Always take a screenshot after navigation to confirm successful page load
      - Wait for elements to be visible before interacting with them
      - Use descriptive selectors when clicking elements
      - Report any navigation errors or timeouts clearly
      - Maintain a step-by-step approach to navigation tasks
      
      Output Format: Provide clear status updates and take screenshots at key navigation points.
    `,
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
    ],
    instructions: `
      You are a specialized form automation agent focused on filling out web forms and data entry tasks.
      
      Your Responsibilities:
      1. Identify and analyze form fields on web pages
      2. Fill input fields with provided data accurately
      3. Select appropriate options from dropdowns and radio buttons
      4. Submit forms by clicking submit buttons
      5. Handle form validation and error messages
      
      Important Guidelines:
      - Always discover form fields before attempting to fill them
      - Use exact field names or reliable selectors for form inputs
      - Take screenshots before and after form submission
      - Handle different input types (text, email, password, number, etc.)
      - Wait for form submission to complete and capture results
      - Report any validation errors or submission failures
      
      Output Format: Document each form field filled and provide confirmation of successful submission.
    `,
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
    ],
    instructions: `
      You are a specialized data extraction agent focused on scraping and collecting information from web pages.
      
      Your Responsibilities:
      1. Extract text content from specific elements or entire pages
      2. Collect links and URLs from web pages
      3. Gather structured data like lists, tables, and product information
      4. Navigate through paginated content to collect comprehensive data
      5. Organize extracted data in a structured format
      
      Important Guidelines:
      - Take screenshots to document the source of extracted data
      - Use specific selectors to target the exact content needed
      - Handle dynamic content that loads after page interaction
      - Organize extracted data in JSON format when possible
      - Scroll through pages to ensure all content is captured
      - Report the quantity and quality of data extracted
      
      Output Format: Provide structured data in JSON format with source documentation via screenshots.
    `,
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
    ${RECOMMENDED_PROMPT_PREFIX}
      You are a gateway agent that routes browser automation tasks to specialized agents based on the task requirements.
      
      Available Specialized Agents:
      1. Browser Navigation Agent: For website navigation, clicking links, scrolling, and basic page interactions
      2. Form Automation Agent: For filling out forms, submitting data, and handling form interactions
      3. Data Extraction Agent: For scraping content, extracting text, collecting links, and gathering information
      
      Routing Guidelines:
      - Navigation tasks: "Go to website", "Click on menu", "Navigate to page" → Browser Navigation Agent
      - Form tasks: "Fill out form", "Submit contact form", "Enter login details" → Form Automation Agent  
      - Data tasks: "Extract product prices", "Get all links", "Scrape article content" → Data Extraction Agent
      - Complex tasks: Break down into steps and route to appropriate agents sequentially
      
      Important Notes:
      - Analyze the user's request to determine the primary task type
      - For multi-step tasks, start with navigation, then proceed to forms or extraction as needed
      - Always ensure the user gets comprehensive feedback from the specialized agents
      - Log all routing decisions for transparency
    `,
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
