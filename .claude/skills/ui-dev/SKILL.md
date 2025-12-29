---
name: ui-dev
description: Build UI components for React Native (mobile) and Next.js (merchant) with dark theme, shadcn/ui, and responsive design (project)
---

# UI Development Skill

## CRITICAL: File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| Component files | 200 | UI components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | Addresses, configs |

## BEFORE WRITING ANY CODE

1. **Check `docs/issues/ui/README.md`** for known pitfalls
2. **Check shadcn/ui via Context7** - resolve library ID, then fetch component docs before coding

---

## Framework Context

**Mobile App (React Native):**
- Expo SDK 54 with Expo Router
- Privy SDK for embedded wallets
- React Native components with StyleSheet
- Ionicons for icons
- Dark theme support required

**Merchant Terminal (Next.js):**
- Next.js 14 with App Router
- Privy React Auth
- Tailwind CSS + shadcn/ui
- Responsive design (mobile-first)
- PWA support

## Design Guidelines

### Colors (TapMove Brand)
```typescript
const colors = {
  primary: '#FF6B00',      // Movement orange
  primaryDark: '#E55A00',
  secondary: '#5b21b6',    // Purple accent
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',

  // Dark theme
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
};
```

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: System monospace (for addresses/hashes)

### Spacing
Use 4px base unit: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

## Component Patterns

**Mobile - Card Component:**
```tsx
<View style={styles.card}>
  <View style={styles.cardHeader}>...</View>
  <View style={styles.cardContent}>...</View>
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
```

**Web - shadcn/ui Card:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Component Structure

```
components/
├── {feature}/
│   ├── {component}.tsx
│   └── {component}-item.tsx
├── shared/
│   ├── button.tsx
│   ├── card.tsx
│   └── modal.tsx
```

## Best Practices

1. **Extract early** - If a section exceeds 50 lines, extract to component
2. **Custom hooks** - 3+ useState = extract to hook
3. **Types separate** - Keep types in `types.ts` files
4. **Loading states** - Every data-dependent component needs skeleton
5. **Error states** - Every async operation needs error handling
6. **Dark mode** - All colors must work in both themes

## Mobile-Specific

- Use SafeAreaView for screens
- Handle keyboard avoidance
- Use Platform.select for platform differences
- Test on both iOS and Android

## Web-Specific

- Use shadcn/ui components when available
- Ensure responsive breakpoints (sm, md, lg)
- PWA manifest and service worker
