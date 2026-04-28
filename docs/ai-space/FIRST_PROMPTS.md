# First Prompts

## Start the AI Space

```text
Read the Ontogony AI Space files. Act as Managing Editor. Summarize the current operating model, then tell me the best next move.
```

## Route Any Task

```text
Managing Editor: route this task through the right Ontogony agents.

Task:
[PASTE TASK]

Give me:
- which agent should lead
- which agents should review
- expected deliverable
- acceptance criteria
- first prompt to use
```

## Continue Tina Integration

```text
Dev Architect + CMS Workflow Specialist:

Continue the TinaCMS integration for ontogony-site.

Start by inspecting the local branch state:
git status --short --branch
git log --oneline -10
git branch --show-current

Goal:
Finish the TinaCMS/editorial workflow integration, preserve ontogony.net config, enable /admin, run checks, and push the branch.

Report files changed, commands run, build status, Tina status, and blockers.
```

## Create a Chapter Companion

```text
Managing Editor + Literary Editor + Philosophy Professor:

Create a site-facing chapter companion plan for Chapter [N].

Use the chapter as source. Identify the problem, opening ordeal, central operator, key concepts, what it establishes, what it hands forward, and where the reader should go next.
```

## Extract Concepts from a Chapter

```text
Philosophy Professor + Managing Editor:

Extract the strongest site concepts from Chapter [N].

For each, give:
- concept title
- short definition
- source chapter
- register/stratum
- related concepts
- why it deserves a page
- suggested body outline
```

## Review a PR

```text
Dev Architect: review this PR for ontogony-site.

Assess:
- build/deploy risk
- architecture fit
- content model impact
- Tina/MDX implications
- route/link issues
- whether to merge

Then route to other agents if prose/design/philosophy review is needed.
```

## Public Review

```text
Reader Advocate: review ontogony.net as a first-time visitor.

Spend the review on:
- first impression
- title/framing
- what the project seems to be
- where you would click next
- where you get lost
- what would make the site easier to enter
```
