# Browser-Use Integration — Global Athlete Management

AI-powered browser automation for athlete research and data collection.

## Two approaches

| | Cloud SDK (`browser-use-sdk`) | Local (`browser-use`) |
|---|---|---|
| Setup | `pip install browser-use-sdk` | `pip install browser-use` + Chromium |
| LLM | Managed by Browser Use | Bring your own (Claude, GPT, Gemini…) |
| Auth | API key | Self-hosted |
| Best for | Production, stealth, scale | Dev, custom tools, private data |

---

## Quick start (Cloud SDK — v3)

```bash
cp .env.example .env          # add your BROWSER_USE_API_KEY
pip install -r requirements.txt
python athlete_researcher.py
```

### Basic usage

```python
from browser_use_sdk.v3 import AsyncBrowserUse
import asyncio

async def main():
    client = AsyncBrowserUse()                    # reads BROWSER_USE_API_KEY from env
    result = await client.run(
        "Go to worldathletics.org and find the top 5 ranked 100m sprinters."
    )
    print(result.output)

asyncio.run(main())
```

### Structured output with Pydantic

```python
from pydantic import BaseModel

class AthleteStats(BaseModel):
    name: str
    sport: str
    world_ranking: int | None
    personal_best: str | None

result = await client.run(
    "Find Armand Duplantis's current world ranking and pole vault PB.",
    schema=AthleteStats,
)
stats: AthleteStats = result.output
print(stats.world_ranking, stats.personal_best)
```

### Live-streaming agent steps

```python
run = client.run("Find the top 10 marathon runners worldwide.")
async for msg in run:
    print(f"[{msg.role}] {msg.summary}")

print(run.result.output)
```

### Scrape products (Amazon example)

```python
result = await client.run(
    "Go to amazon.com, extract 100 products with price and reviews, "
    "save to products.csv"
)
print(result.output)
```

### run() parameters

| Parameter | Type | Description |
|---|---|---|
| `task` | `str` | Natural language instruction (required) |
| `schema` / `output_schema` | `type[BaseModel]` | Pydantic model for typed output |
| `model` | `str` | Override the LLM model |
| `session_id` | `str \| UUID` | Resume an existing session |
| `keep_alive` | `bool` | Keep browser alive after task |
| `max_cost_usd` | `float` | Spend cap per task |
| `profile_id` | `str` | Persistent browser profile (cookies/auth) |
| `proxy_country_code` | `str` | Route through a specific country |
| `sensitive_data` | `dict[str, str]` | Credentials injected without leaking to logs |
| `enable_recording` | `bool` | Record the browser session |
| `cache_script` | `bool \| None` | Cache the agent script for $0 LLM re-runs |

---

## Local open-source agent

```python
from browser_use import Agent, Browser, Tools, ActionResult
from langchain_anthropic import ChatAnthropic

tools = Tools()

@tools.action(description="Save extracted data to CSV")
async def save_csv(data: str, filename: str) -> ActionResult:
    with open(filename, "w") as f:
        f.write(data)
    return ActionResult(extracted_content=f"Saved {filename}")

agent = Agent(
    task="Go to worldathletics.org, extract the top 100m sprint rankings.",
    llm=ChatAnthropic(model="claude-sonnet-4-6"),
    browser=Browser(),
    tools=tools,
    use_vision=True,
)

await agent.run(max_steps=20)
```

### Agent constructor — key parameters

| Parameter | Description |
|---|---|
| `task` | Instruction for the agent |
| `llm` | LangChain chat model |
| `browser` | `Browser()` instance |
| `tools` | Custom `Tools()` registry |
| `use_vision` | `True / False / 'auto'` — include screenshots |
| `use_thinking` | Extended reasoning before acting |
| `max_actions_per_step` | Max concurrent actions (default 5) |
| `max_failures` | Consecutive failures before abort (default 5) |
| `sensitive_data` | `dict` of credentials (masked in prompts) |
| `enable_planning` | Generate multi-step plan before acting |
| `output_model_schema` | Pydantic model for structured extraction |

---

## Files

- `athlete_researcher.py` — Cloud SDK v3 integration (research, news, scraping)
- `local_agent.py` — Local open-source agent examples
- `requirements.txt` — Dependencies
- `.env.example` — Environment variable template
