---
description: Execute a prompt from the prompts/ directory
argument: <prompt_number>
---

You are executing prompt $ARGUMENTS from the prompts/ directory.

**IMPORTANT: Actually execute the work, do not just describe what you would do.**

First, read the prompt file at `prompts/$ARGUMENTS.md` using the Read tool.

After reading, you must:

1. If the prompt specifies a **Skill** at the top, load that skill using the Skill tool before proceeding.

2. **Check relevant learnings in `docs/issues/`** based on task type:
   - Move/contracts → `docs/issues/move/README.md`
   - UI/frontend → `docs/issues/ui/README.md`
   - Indexer → `docs/issues/indexer/README.md`
   - Movement network → `docs/issues/movement/README.md`
   - Tooling → `docs/issues/tooling/README.md`

3. **Execute ALL requirements** in the prompt - create files, write code, modify configurations. Do the actual implementation work.

4. After completing the implementation, run through every item in the **Verification** section. Actually run the commands and verify they work.

5. When everything is verified working, delete the prompt file: `rm prompts/$ARGUMENTS.md`

6. Finally, report:
   - Summary of what was built
   - List of files created/modified
   - Any issues encountered
   - List remaining prompts in `prompts/` directory

Remember: You are IMPLEMENTING the prompt, not describing it. Write real code, create real files, and verify the work is complete.
