---
name: strategy
description: Strategic planning mode for complex features. Generates executable prompts for multi-session implementation. (project)
---

# Strategy Skill

## Purpose

Strategic planning mode for complex features. Use when you need to:
- Break down large goals into executable steps
- Generate prompts for multi-session implementation
- Plan architecture before coding

## Activation

```
/strategy <goal>
```

## Behavior

When in strategy mode:

1. **NO CODE WRITING** - Only planning and research
2. **Analyze the goal** - Understand scope and requirements
3. **Research codebase** - Explore existing patterns
4. **Identify dependencies** - What must be built first
5. **Generate prompts** - Write to `prompts/` directory
6. **Track progress** - As prompts are completed

## Prompt Structure

Each prompt in `prompts/N.md` should include:

```markdown
# Prompt N: [Title]

**Skill:** `[skill-name]` or None

## Objective
[Clear 1-2 sentence goal]

## Requirements
### 1. [Requirement]
[Details with code examples if helpful]

### 2. [Requirement]
...

## Verification
- [ ] [Testable outcome]
- [ ] [Testable outcome]

## Notes
[Important context or warnings]
```

## Execution Flow

1. User runs `/strategy <goal>`
2. Strategy mode analyzes and creates prompts
3. User runs prompts in fresh sessions: `/run-prompt N`
4. After completion, user reports: "completed prompt N"
5. Strategy mode tracks progress and can generate more prompts

## Prompt Organization

- **Prompts 1-3**: Foundation/setup
- **Prompts 4-7**: Core features
- **Prompts 8-10**: Secondary features
- **Prompts 11-12**: Integration and polish

## Dependencies

Prompts should be:
- **Independent when possible** - Can run in parallel
- **Clearly ordered** - When dependencies exist
- **Self-contained** - All context included

## Best Practices

1. Keep prompts focused (1-2 hours of work each)
2. Include verification steps
3. Reference skills for domain context
4. Avoid assumptions - include all needed info
5. Order by dependency, then priority
