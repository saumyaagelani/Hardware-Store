@AGENTS.md

# Project rules

## Keep the README up to date (required)
Every change to the code that gets committed must also update `README.md` in the same commit:
1. Add an entry at the top of the **Change log** section (newest first): a `### YYYY-MM-DD — Short title` heading and plain-English bullets of what changed, written for a non-technical reader.
2. Update the **Last updated** date near the top of the README.
3. Update any other README section the change affects (features, demo accounts, commands, colours, limitations, test counts, deployment).
Also tick off or add items in `PRODUCTION_TODO.md` when relevant.

## Before pushing
Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`; run `npm run test:e2e` for changes that affect user journeys. Push to the working branch (currently `claude/intelligent-edison-536z5s`) — Render redeploys the live demo automatically.
