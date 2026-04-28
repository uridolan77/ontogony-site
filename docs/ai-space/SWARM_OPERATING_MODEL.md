# Swarm Operating Model

This file explains how to use the Ontogony agents without creating chaos.

## Principle

The swarm is role-orchestrated, not autonomous.

You remain the final editor and director. The Managing Editor coordinates the roles. Specialist agents contribute where useful.

## Recommended Model

```txt
You
 ↓
Managing Editor
 ↓
Specialist Agent(s)
 ↓
Dev Architect or Editor implements
 ↓
Review Agent
 ↓
You approve
```

## Three Levels of Swarm Management

### Level 1 — Manual Role Orchestration

Use one AI space. Invoke agents by name.

Example:

```text
Managing Editor: route this.
Philosophy Professor: review the concept.
Literary Editor: revise the prose.
Dev Architect: implement the approved MDX.
```

Best for daily use.

### Level 2 — GitHub-Mediated Swarm

Use GitHub issues and PRs as shared memory.

- Issues define tasks
- Labels define agents
- PRs define changes
- Comments hold reviews
- README/AGENTS/ROADMAP hold durable instructions

Best for real site management.

### Level 3 — Automated Swarm

Later, repeated workflows can be automated with scripts, GitHub Actions, n8n, or agent frameworks.

Example:

```txt
upload chapter
→ extract concepts
→ create issues
→ draft MDX
→ request philosophical review
→ request literary edit
→ open PR
```

Not necessary first.

## Recommended Current Setup

Use:

```txt
AGENTS.md
GitHub Issues
GitHub PRs
Copilot / Claude Code / ChatGPT
TinaCMS
```

Do not try to fully automate the swarm until the editorial workflow is stable.

## GitHub Labels

Suggested labels:

```txt
agent:managing-editor
agent:dev-architect
agent:design-director
agent:literary-editor
agent:philosophy-professor
agent:reader-advocate
agent:diagram-cartographer
agent:cms-workflow
type:concept
type:essay
type:path
type:diagram
type:fragment
type:cms
type:design
type:bug
type:qa
status:needs-review
status:ready-for-dev
status:ready-to-merge
```

## Workflow Examples

### Chapter Companion Workflow

1. Managing Editor creates issue
2. Literary Editor drafts outline
3. Philosophy Professor checks argument
4. Reader Advocate checks onboarding
5. Dev Architect creates MDX
6. PR reviewed and merged

### Concept Page Workflow

1. Managing Editor identifies concept
2. Philosophy Professor defines rigorously
3. Literary Editor makes readable
4. Reader Advocate checks clarity
5. Dev Architect adds concept MDX and links

### CMS Workflow

1. CMS Workflow Specialist proposes admin experience
2. Dev Architect implements Tina schema
3. Managing Editor tests authoring
4. Dev Architect fixes blockers
5. Production admin enabled

## Default Routing Prompt

```text
Managing Editor: route this task. Tell me which specialist agents should handle it, in what order, and what the final deliverable should be.
```

## Swarm Rule

Use multiple agents when the task genuinely has multiple dimensions.

Do not invoke the whole swarm for small tasks.
