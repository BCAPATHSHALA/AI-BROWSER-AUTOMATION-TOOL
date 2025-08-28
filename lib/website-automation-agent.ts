import { Agent, Runner } from "@openai/agents";
import { createBrowserTools } from "./browser-tools";
import { SYSTEMPROMPTS } from "./system-prompts";

const websiteAutomationAgent = () => {
  const browserTools = createBrowserTools();
  const {
    initializeBrowser,
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
    closeBrowser,
    findContactForm,
  } = browserTools;

  return new Agent({
    name: "Website Automation Agent",
    tools: [
      initializeBrowser,
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
      closeBrowser,
      findContactForm,
    ],
    instructions: `${SYSTEMPROMPTS.WEBSITE_AUTOMATION_AGENT}`,
  });
};

const runner = new Runner({
  model: "gpt-4o-mini",
});

export const chatWithAgent = async ({ userQuery }: { userQuery: string }) => {
  try {
    const agent = websiteAutomationAgent();
    const result = await runner.run(agent, userQuery);
    const aiResponse = {
      history: result.history,
      lastAgent: result.lastAgent?.name,
      finalOutput: result.finalOutput,
    };
    return aiResponse;
  } catch (err) {
    console.error("Agent Error:", err);
    throw new Error("Automation task failed due to timeout or invalid input.");
  }
};
