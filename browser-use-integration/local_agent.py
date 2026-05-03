"""
Local Browser-Use Agent
Uses the open-source browser-use library (not the cloud SDK) with any LLM.
Requires: pip install browser-use playwright
          playwright install chromium
"""

import asyncio
import os
from typing import Optional

# Local browser-use (open-source)
# from browser_use import Agent, Browser, Tools, ActionResult
# from browser_use.browser.context import BrowserContext
# from langchain_anthropic import ChatAnthropic
# from langchain_openai import ChatOpenAI


# ---------------------------------------------------------------------------
# Example: local agent with custom tools
# ---------------------------------------------------------------------------

EXAMPLE_CODE = '''
from browser_use import Agent, Browser, Tools, ActionResult
from browser_use.browser.context import BrowserContext
from langchain_anthropic import ChatAnthropic
import asyncio

tools = Tools()

@tools.action(description="Save athlete data to local file")
async def save_athlete_data(data: str, filename: str) -> ActionResult:
    with open(filename, "w") as f:
        f.write(data)
    return ActionResult(extracted_content=f"Saved to {filename}")


@tools.action(description="Look up athlete in local database")
async def lookup_local_db(athlete_name: str) -> ActionResult:
    # Query your own DB here
    result = f"Local record for {athlete_name}: [found]"
    return ActionResult(extracted_content=result)


async def main():
    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )

    browser = Browser()

    agent = Agent(
        task=(
            "Go to worldathletics.org and find the top 10 ranked 100m sprinters. "
            "Extract their names, nationalities, and personal bests. "
            "Then save the data to athletes_100m.json."
        ),
        llm=llm,
        browser=browser,
        tools=tools,
        use_vision=True,
        max_actions_per_step=5,
    )

    await agent.run(max_steps=25)
    await browser.close()


asyncio.run(main())
'''

EXAMPLE_WITH_SENSITIVE_DATA = '''
from browser_use import Agent, Browser
from langchain_anthropic import ChatAnthropic

async def login_and_research():
    """
    Example: agent logs into a sports platform using credentials
    stored securely in sensitive_data (never passed as plain text in the task).
    """
    llm = ChatAnthropic(model="claude-sonnet-4-6")
    browser = Browser()

    agent = Agent(
        task=(
            "Log into the athlete portal with username <username> and "
            "password <password>. Then export the training data for "
            "the last 30 days as CSV."
        ),
        llm=llm,
        browser=browser,
        sensitive_data={
            "username": "athlete@example.com",
            "password": "s3cret!",
        },
    )

    await agent.run()
    await browser.close()
'''

EXAMPLE_CLOUD_PROFILE = '''
from browser_use import Agent, Browser
from browser_use.browser.context import BrowserContext
from langchain_anthropic import ChatAnthropic

# Use a persistent cloud browser profile (keeps cookies/auth between runs)
async def with_cloud_profile():
    browser = Browser(use_cloud=True)

    agent = Agent(
        task="Check my athlete dashboard and download the latest performance report.",
        llm=ChatAnthropic(model="claude-sonnet-4-6"),
        browser=browser,
    )

    result = await agent.run()
    print(result)
'''


def print_examples() -> None:
    print("=== Local browser-use examples ===\n")
    print("1. Agent with custom tools:\n", EXAMPLE_CODE)
    print("\n2. Agent with sensitive credentials:\n", EXAMPLE_WITH_SENSITIVE_DATA)
    print("\n3. Agent with cloud browser profile:\n", EXAMPLE_CLOUD_PROFILE)


if __name__ == "__main__":
    print_examples()
