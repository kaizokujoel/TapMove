# TapMove Completion Prompts

These prompts will complete the TapMove app from ~92% to 100% MVP.

## Quick Reference

| # | Prompt | Priority | Est. Time | Dependencies |
|---|--------|----------|-----------|--------------|
| 1 | Backend Database Persistence | Critical | 2-3 hrs | None |
| 2 | Payment Expiry & Cleanup | Critical | 1-2 hrs | Prompt 1 |
| 3 | Contract Deployment | Critical | 1-2 hrs | Aptos CLI |
| 4 | Mobile Payment Flow Polish | High | 2-3 hrs | Prompt 3 |
| 5 | Merchant Real-time Updates | High | 2-3 hrs | Prompt 1, 2 |
| 6 | NFC Tag Writing (Merchant) | Medium | 1-2 hrs | Web NFC supported device |
| 7 | NFC Reading & Deep Links (Mobile) | Medium | 2 hrs | Android device |
| 8 | Backend Auth & Security | Medium | 2 hrs | Prompt 1 |
| 9 | E2E Integration Testing | High | 2-3 hrs | All above |
| 10 | Environment & Deployment | Critical | 1-2 hrs | None |

## Execution Order

### Phase 1: Foundation (Critical Path)
```
1 → 2 → 3 → 10
```
These must be done first and in order.

### Phase 2: Polish (Can be parallelized)
```
4 (Mobile)  ─┐
5 (Merchant) ├→ 9 (Testing)
6 (NFC Write)│
7 (NFC Read) ┘
8 (Security) ─→ 9 (Testing)
```

## How to Run a Prompt

1. Start a fresh Claude session
2. Say: "run prompt N" (e.g., "run prompt 1")
3. Claude will read the prompt and execute the work
4. After completion, say: "completed prompt N"

## Progress Tracking

- [ ] Prompt 1: Backend Database Persistence
- [ ] Prompt 2: Payment Expiry & Cleanup
- [ ] Prompt 3: Contract Deployment
- [ ] Prompt 4: Mobile Payment Flow Polish
- [ ] Prompt 5: Merchant Real-time Updates
- [ ] Prompt 6: NFC Tag Writing
- [ ] Prompt 7: NFC Reading & Deep Links
- [ ] Prompt 8: Backend Auth & Security
- [ ] Prompt 9: E2E Integration Testing
- [ ] Prompt 10: Environment Configuration

## Issues Reference

Each prompt instructs to check relevant issues folders before starting:

| Domain | Issues Folder |
|--------|---------------|
| Frontend/UI | `docs/issues/ui/README.md` |
| Move Contracts | `docs/issues/move/README.md` |
| Movement Network | `docs/issues/movement/README.md` |
| Indexing/GraphQL | `docs/issues/indexer/README.md` |
| Tooling | `docs/issues/tooling/README.md` |

## Expected Outcome

After completing all prompts:
- ✅ Persistent data storage (survives restarts)
- ✅ Automatic payment expiry handling
- ✅ Contracts deployed on Movement testnet
- ✅ Robust error handling in payment flow
- ✅ Real-time merchant notifications
- ✅ Full NFC support (read + write)
- ✅ API authentication & rate limiting
- ✅ Comprehensive test coverage
- ✅ Proper environment configuration

**Result: 100% complete hackathon-ready demo**
