# ⚡ SwarmDesk — Automated Slack Incident & Bug Triage

A custom Slack Slash Command app (`/triage`) powered by Node.js (Pipedream webhook) and Slack Block Kit that converts raw incident reports into structured triage cards.

![SwarmDesk Live Demo](Screenshot%202026-11-24%20233506.jpg)

## Features
- **Regex Command Parsing:** Extracts severity (`P1`, `P2`, `P3`), `@owner` mentions, and clean issue summaries from `/triage [P1|P2|P3] [summary] [@owner]`.
- **Dynamic SLA Routing:** Automatically assigns response targets (`15 min`, `2 hours`, or `Next business day`) and tailored first-response checklists.
- **Unique Ticket IDs:** Generates `SWM-XXXX` tracking IDs with UTC timestamps and reporter attribution.
- **Built-in Help Fallback:** Running `/triage` or `/triage help` posts an interactive quick-usage guide.

## Required Slack Scopes
- `commands` — Registers the `/triage` slash command.
- `chat:write` — Posts formatted Block Kit incident cards to invited channels.
