# TapMove - NFC Tap-to-Pay with Privy Wallets on Movement

TapMove is a mobile-first payment app enabling tap-to-pay cryptocurrency transactions using NFC and Privy embedded wallets. Users tap their phone to pay merchants in USDC on Movement with sub-second settlement.

---

## Git Configuration (MANDATORY)

**ALWAYS use these credentials for ALL commits and pushes:**

| Setting | Value |
|---------|-------|
| **User Name** | `gabrielantonyxaviour` |
| **User Email** | `gabrielantony56@gmail.com` |

Before making any commits, ALWAYS run:
```bash
git config user.name "gabrielantonyxaviour"
git config user.email "gabrielantony56@gmail.com"
```

**DO NOT use any other git identity for this project.**

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in codebase
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

Files over 300 lines (~25000 tokens) CANNOT be read by AI tools and block development.

### Limits by File Type

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | Addresses, configs |
| `*-service.ts` | 300 | API services |
| `*.move` | 300 | Move modules |
| `components/shared/*.tsx` | 150 | Reusable UI |

### Required Structure for Features

Every feature MUST be decomposed:

```
app/{feature}/
├── page.tsx              # Orchestration only (< 150 lines)
├── components/
│   ├── main-tab.tsx      # Tab components (< 250 lines each)
│   └── shared/
│       └── reusable.tsx
├── hooks/
│   ├── use-{feature}.ts  # Business logic (< 200 lines)
│   └── use-{feature}-query.ts
├── types.ts              # Type definitions (< 100 lines)
└── constants.ts          # Addresses, configs (< 150 lines)
```

### When to Decompose

| Trigger | Action |
|---------|--------|
| File > 300 lines | MUST decompose immediately |
| 3+ useState hooks | Extract to custom hook |
| Multiple tabs/sections | Split into separate components |
| Types inline | Move to types.ts |

**See `code-structure` skill for detailed patterns.**

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

Context7 is the ONLY reliable way to get up-to-date SDK/library documentation. WebFetch fails frequently and returns incomplete/unusable results.

### How to Use Context7

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "privy" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/privy-io/docs",
     topic: "embedded wallets",
     mode: "code"  // or "info" for conceptual guides
   })
```

### When to Use Context7

| Scenario | Action |
|----------|--------|
| Need SDK/library docs | **USE CONTEXT7** |
| Checking API usage | **USE CONTEXT7** |
| Finding code examples | **USE CONTEXT7** |
| Learning library patterns | **USE CONTEXT7** |
| Any documentation need | **USE CONTEXT7** |

### Common Libraries in This Project

| Library | Context7 ID |
|---------|-------------|
| Privy | `/privy-io/docs` |
| React Native | `/facebook/react-native` |
| Expo | `/expo/expo` |
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| shadcn/ui | `/shadcn-ui/ui` |
| Aptos SDK | `/aptos-labs/aptos-ts-sdk` |

### DO NOT

- **NEVER use WebFetch for documentation** - It's unreliable and often fails
- **NEVER guess SDK usage** - Always verify with Context7 first
- **NEVER assume API signatures** - Look them up via Context7

---

## Skills (LOAD BEFORE STARTING TASKS)

**IMPORTANT: Always load the appropriate skill BEFORE starting any task.** Skills provide essential context, patterns, and instructions for each domain.

### How to Use Skills

Load a skill by invoking it at the start of your task:
```
skill: "ui-dev"
skill: "move-contracts"
skill: "privy-integration"
skill: "nfc-payments"
```

### Required Skills by Task Type

| Task Type | Required Skill | Examples |
|-----------|----------------|----------|
| **Any New Code** | `code-structure` | File size limits, decomposition patterns, component architecture |
| **UI/Frontend** | `ui-dev` | Building components, styling, layouts, animations, responsive design, shadcn/ui |
| **Move Contracts** | `move-contracts` | Writing Move modules, testing, deployment on Movement |
| **Privy Wallet** | `privy-integration` | Embedded wallets, signing, authentication |
| **NFC/Payments** | `nfc-payments` | NFC reading/writing, payment flows, QR codes |
| **Strategic Planning** | `strategy` | NO-CODE mode, breaking goals into executable prompts |

### Skill Loading Rules

1. **ALWAYS load a skill** when the task matches any skill description above
2. **Load BEFORE writing any code** - skills contain critical patterns and conventions
3. **Multiple skills** - If a task spans multiple domains, load the primary skill first
4. **Don't skip skills** - Even for "simple" tasks, skills ensure consistency

---

## Multi-Prompt System

This project uses a multi-session prompt system for complex features.

### How It Works

1. **`/strategy <goal>`** - Enter planning mode, breaks goal into executable prompts
2. **Prompts written to `prompts/`** - As `1.md`, `2.md`, `3.md`, etc.
3. **Run prompts** - Use `/run-prompt N` or say "run prompt N"
4. **Report completion** - "completed prompt N"

### Running Prompts

Use `/run-prompt N` where N is the prompt number (e.g., `/run-prompt 1`).

**CRITICAL: When running a prompt, you must ACTUALLY IMPLEMENT the work:**

1. **Read** `prompts/N.md` completely
2. **Load skill** if specified (e.g., `skill: "ui-dev"`) using the Skill tool
3. **IMPLEMENT** - Write real code, create real files, make real changes. Do NOT just describe what you would do.
4. **Verify** - Run the verification commands and confirm they pass
5. **Delete** - Remove the prompt file with `rm prompts/N.md`
6. **Report** - Summarize what was built and list remaining prompts

### DO NOT when running prompts:
- Do NOT output placeholder text like "[Creates file...]"
- Do NOT describe what you would do - actually do it
- Do NOT skip verification steps
- Do NOT leave the prompt file if work is incomplete

---

## Project Structure

```
TapMove/
├── CLAUDE.md                     # This file
├── PRD.md                        # Product Requirements Document
├── .claude/                      # Claude configuration
│   ├── commands/                 # Slash commands
│   └── skills/                   # Development skills
│
├── mobile/                       # React Native Customer App
│   ├── app/                      # Expo Router pages
│   ├── components/               # UI components
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities, services
│   │   ├── privy/                # Privy integration
│   │   ├── nfc/                  # NFC handling
│   │   └── movement/             # Movement SDK
│   └── constants/                # Config, addresses
│
├── merchant/                     # Next.js Merchant Terminal
│   ├── app/                      # App router pages
│   ├── components/               # UI components
│   ├── hooks/                    # Custom hooks
│   └── lib/                      # Services, utilities
│
├── contracts/                    # Move Smart Contracts
│   ├── sources/                  # Move modules
│   │   ├── payment.move          # Payment logic
│   │   └── merchant.move         # Merchant registry
│   ├── tests/                    # Move tests
│   ├── Move.toml                 # Package manifest
│   └── deployment.config.json    # Deployment addresses
│
└── backend/                      # Node.js Backend
    ├── src/
    │   ├── routes/               # API endpoints
    │   ├── services/             # Business logic
    │   └── lib/                  # Utilities
    └── package.json
```

---

## Move Development (Movement Network)

### Key Differences from EVM

| Aspect | EVM (Solidity) | Movement (Move) |
|--------|----------------|-----------------|
| Language | Solidity | Move |
| Framework | Foundry/Hardhat | Aptos CLI |
| Testing | forge test | aptos move test |
| Deploy | forge script | aptos move publish |
| Account Model | Single balance | Resource-based |
| Assets | ERC-20 tokens | Coin resources |

### Move CLI Commands

```bash
# Build
cd contracts && aptos move compile

# Test
aptos move test

# Publish to Movement testnet
aptos move publish --profile movement-testnet

# Call function
aptos move run --function-id 'MODULE_ADDRESS::payment::pay' --args ...
```

### Movement Network Config

| Network | Chain ID | RPC |
|---------|----------|-----|
| Movement Testnet | TBD | TBD |
| Movement Mainnet | TBD | TBD |

---

## Privy Integration

### Key Patterns

```typescript
// Provider setup
import { PrivyProvider } from "@privy-io/react-native-auth";

<PrivyProvider
  appId={PRIVY_APP_ID}
  config={{
    embeddedWallets: {
      createOnLogin: "all-users",
      noPromptOnSignature: false,  // Always prompt for payments
    },
    loginMethods: ["email", "google", "apple"],
  }}
>
  {children}
</PrivyProvider>

// Using wallet
const { wallets } = useWallets();
const wallet = wallets[0];  // Embedded wallet
const signedTx = await wallet.signTransaction(tx);
```

### Movement + Privy

Since Movement uses Move (Aptos-based), Privy wallets need to:
1. Sign Move transactions (Aptos format)
2. Use Movement-compatible address format
3. Interact with Move modules

---

## NFC Payment Flow

### Payment Request Format

```typescript
interface PaymentRequest {
  id: string;           // Unique payment ID
  merchant: string;     // Merchant Movement address
  amount: string;       // Amount in USDC (decimal string)
  memo: string;         // Order description
  expiry: number;       // Unix timestamp
}
```

### NFC URI Scheme

```
TapMove://pay?id={payment_id}
```

The app fetches full payment details from backend using the ID.

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/strategy <goal>` | Enter planning mode, generate prompts for complex features |
| `/debug` | Strategic debugging across contracts, mobile, merchant |
| `/deploy-contracts` | Deploy Move contracts to Movement |
| `/test-payment` | End-to-end payment flow test |

---

## Issues & Learnings System

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| UI/Frontend | `../docs/issues/ui/README.md` |
| Move contracts | `../docs/issues/move/README.md` |
| Indexing/GraphQL | `../docs/issues/indexer/README.md` |
| Movement network | `../docs/issues/movement/README.md` |

### When to Document a New Learning

**DOCUMENT if ALL of these are true:**
1. It caused repeated back-and-forth debugging (wasted user's time)
2. It's non-obvious (you wouldn't naturally avoid it)
3. It will happen again in future projects
4. The fix isn't easily searchable in official docs

**DO NOT document:**
- Basic syntax errors or typos
- Standard patterns you already know
- One-off edge cases unlikely to repeat
- Things covered in official documentation

### How to Add a Learning

1. Determine category: `ui/`, `move/`, `indexer/`, or `movement/`
2. Read the existing README.md in that folder
3. Add new issue following the template format (increment ID)
4. Keep it focused: problem → root cause → solution → prevention

---

## DO NOT

- **Create files over 300 lines** - They cannot be read by AI tools
- **Put everything in page.tsx** - Decompose into components, hooks, types, constants
- **Use WebFetch for documentation** - ALWAYS use Context7 MCP instead
- **Skip loading skills** - Always load appropriate skill before starting work
- **Guess SDK/API usage** - Look it up via Context7 first
- Mix Solidity patterns with Move
- Create directories outside established structure
- Start coding without loading the relevant skill first
- Put type definitions inline in components

## DO

- **Keep files under 300 lines** - Decompose early and often
- **Load `code-structure` skill** - For any new component or feature
- **Use Context7 MCP for ALL documentation** - It's the only reliable method
- **Load skills FIRST** - Before any task, load the matching skill(s)
- **Verify SDK patterns via Context7** - Before implementing any library integration
- Extract business logic to hooks
- Keep page.tsx as pure orchestration
- Put types in types.ts
- Follow Move best practices for contracts
- Handle loading/error states in UI
