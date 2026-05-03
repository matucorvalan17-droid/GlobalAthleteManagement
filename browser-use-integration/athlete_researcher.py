"""
Athlete Web Research Agent
Uses browser-use-sdk (cloud) to automate web research for athlete profiles.
"""

import asyncio
import csv
import json
import os
from typing import Optional
from pydantic import BaseModel

from browser_use_sdk.v3 import AsyncBrowserUse


# ---------------------------------------------------------------------------
# Structured output schemas
# ---------------------------------------------------------------------------

class AthleteStats(BaseModel):
    name: str
    sport: str
    nationality: str
    world_ranking: Optional[int] = None
    recent_results: list[str] = []
    personal_bests: dict[str, str] = {}
    upcoming_events: list[str] = []


class AthleteNews(BaseModel):
    athlete_name: str
    headlines: list[str] = []
    sources: list[str] = []


class ProductList(BaseModel):
    products: list[dict] = []


# ---------------------------------------------------------------------------
# Core agent functions
# ---------------------------------------------------------------------------

async def research_athlete(athlete_name: str, sport: str) -> AthleteStats:
    """
    Research an athlete's current stats, ranking, and upcoming events
    using a browser-use cloud agent.
    """
    client = AsyncBrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

    task = (
        f"Research the athlete '{athlete_name}' who competes in {sport}. "
        f"Find their current world ranking, recent competition results (last 3), "
        f"personal bests or records, and upcoming scheduled events. "
        f"Return the structured data as requested."
    )

    try:
        result = await client.run(task, schema=AthleteStats)
        return result.output
    finally:
        await client.close()


async def get_athlete_news(athlete_name: str) -> AthleteNews:
    """Fetch latest news headlines for an athlete."""
    client = AsyncBrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

    task = (
        f"Search for the latest news about athlete '{athlete_name}'. "
        f"Find up to 5 recent headlines with their sources."
    )

    try:
        result = await client.run(task, schema=AthleteNews)
        return result.output
    finally:
        await client.close()


async def stream_athlete_research(athlete_name: str, sport: str) -> None:
    """
    Research an athlete with live streaming of agent steps.
    Shows each browser action as it happens.
    """
    client = AsyncBrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

    task = (
        f"Research '{athlete_name}' ({sport}): find their current ranking, "
        f"latest results, and any upcoming competitions."
    )

    run = client.run(task)
    async for msg in run:
        print(f"  [{msg.role}] {msg.summary}")

    result = run.result
    print(f"\nFinal output:\n{result.output}")
    await client.close()


async def scrape_sports_equipment(
    category: str,
    max_products: int = 100,
    output_file: str = "products.csv",
) -> list[dict]:
    """
    Scrape sports equipment listings.
    Example: replicate the pattern from the user's Amazon demo.
    """
    client = AsyncBrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

    task = (
        f"Go to amazon.com, search for '{category}' sports equipment. "
        f"Extract up to {max_products} products with: name, price, rating, "
        f"number of reviews, and ASIN. Save the data."
    )

    try:
        result = await client.run(task, schema=ProductList)
        products = result.output.products if result.output else []

        if products and output_file:
            _save_to_csv(products, output_file)
            print(f"Saved {len(products)} products to {output_file}")

        return products
    finally:
        await client.close()


# ---------------------------------------------------------------------------
# Batch research
# ---------------------------------------------------------------------------

async def research_team_roster(roster: list[dict]) -> list[AthleteStats]:
    """
    Research multiple athletes concurrently.
    Each entry in roster must have 'name' and 'sport' keys.
    """
    client = AsyncBrowserUse(api_key=os.getenv("BROWSER_USE_API_KEY"))

    async def _research_one(athlete: dict) -> AthleteStats:
        task = (
            f"Research athlete '{athlete['name']}' ({athlete['sport']}). "
            f"Return their world ranking, last 3 results, and personal bests."
        )
        result = await client.run(task, schema=AthleteStats)
        return result.output

    try:
        results = await asyncio.gather(
            *[_research_one(a) for a in roster],
            return_exceptions=True,
        )
        return [r for r in results if isinstance(r, AthleteStats)]
    finally:
        await client.close()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _save_to_csv(records: list[dict], filepath: str) -> None:
    if not records:
        return
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)


# ---------------------------------------------------------------------------
# CLI demo
# ---------------------------------------------------------------------------

async def main() -> None:
    print("=== Global Athlete Management — Browser-Use Research Agent ===\n")

    # Demo 1: research a single athlete (streaming)
    print("1. Streaming research for Mondo Duplantis (Pole Vault):")
    await stream_athlete_research("Armand Mondo Duplantis", "Pole Vault")

    # Demo 2: structured stats lookup
    print("\n2. Structured stats for Sydney McLaughlin-Levrone (400m Hurdles):")
    stats = await research_athlete("Sydney McLaughlin-Levrone", "400m Hurdles")
    if stats:
        print(json.dumps(stats.model_dump(), indent=2))

    # Demo 3: latest news
    print("\n3. Latest news for Novak Djokovic (Tennis):")
    news = await get_athlete_news("Novak Djokovic")
    if news:
        for headline in news.headlines:
            print(f"  • {headline}")

    # Demo 4: scrape sports products (mirrors user's Amazon example)
    print("\n4. Scraping running shoes from Amazon (up to 100 products):")
    products = await scrape_sports_equipment(
        category="running shoes",
        max_products=100,
        output_file="running_shoes.csv",
    )
    print(f"  Found {len(products)} products.")


if __name__ == "__main__":
    asyncio.run(main())
