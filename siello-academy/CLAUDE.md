@AGENTS.md

## UI/UX Skill

This project uses the ui-ux-pro-max skill. Before making any visual/UI changes, query the design intelligence engine:

```bash
# Style recommendations for sports/scouting dark dashboard
python3 ../.claude/skills/ui-ux-pro-max/scripts/search.py "sports athlete scouting dark dashboard" --domain style -n 3

# Color palettes
python3 ../.claude/skills/ui-ux-pro-max/scripts/search.py "sports performance analytics" --domain color -n 3

# Typography
python3 ../.claude/skills/ui-ux-pro-max/scripts/search.py "sports report professional" --domain typography -n 3

# Full design system for the product
python3 ../.claude/skills/ui-ux-pro-max/scripts/search.py "football scouting report" --design-system -p "Siello Academy"
```

Stack in use: standalone HTML + React CDN (use `html-tailwind` as closest stack reference).
