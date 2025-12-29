---
name: nfc-payments
description: NFC reading/writing and payment flows for tap-to-pay functionality. Use for NFC integration and QR code payments. (project)
---

# NFC Payments Skill

## Overview

NFC (Near Field Communication) enables tap-to-pay functionality. TapMove uses NFC to transfer payment request IDs from merchant terminals to customer phones.

## Platform Support

| Platform | Read Support | Write Support | Notes |
|----------|-------------|---------------|-------|
| Android | ✅ Full | ✅ Full | Works in foreground + background |
| iOS | ⚠️ Limited | ❌ No | Requires explicit scan trigger |
| Chrome Android | ✅ Web NFC | ✅ Web NFC | Merchant terminal |

## React Native (Customer App)

### Dependencies
```json
{
  "react-native-nfc-manager": "^3.14.0"
}
```

### Initialization
```typescript
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

async function initNfc() {
  const supported = await NfcManager.isSupported();
  if (supported) {
    await NfcManager.start();
  }
  return supported;
}
```

### Reading NFC Tags
```typescript
async function readNfcTag(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    const ndefRecords = tag?.ndefMessage;

    if (ndefRecords) {
      const uriRecord = ndefRecords.find(
        r => r.tnf === Ndef.TNF_WELL_KNOWN
      );
      if (uriRecord) {
        const uri = Ndef.uri.decodePayload(uriRecord.payload);
        return uri; // "tapmove://pay?id=pay_abc123"
      }
    }
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest();
  }
}
```

### Listening for Tags
```typescript
function startListening(onTag: (paymentId: string) => void) {
  NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
    const uri = parseTag(tag);
    if (uri) {
      const paymentId = extractPaymentId(uri);
      onTag(paymentId);
    }
  });

  NfcManager.registerTagEvent();
}

function stopListening() {
  NfcManager.unregisterTagEvent();
  NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
}
```

## Android Configuration

### app.json
```json
{
  "android": {
    "permissions": [
      "android.permission.NFC"
    ],
    "intentFilters": [
      {
        "action": "android.nfc.action.NDEF_DISCOVERED",
        "category": ["android.intent.category.DEFAULT"],
        "data": {
          "scheme": "tapmove"
        }
      }
    ]
  }
}
```

## Web NFC (Merchant Terminal)

### Writing NFC Tags
```typescript
async function writePaymentToNfc(paymentId: string) {
  if (!('NDEFReader' in window)) {
    throw new Error('Web NFC not supported');
  }

  const ndef = new NDEFReader();

  await ndef.write({
    records: [{
      recordType: "url",
      data: `tapmove://pay?id=${paymentId}`
    }]
  });
}
```

## Payment URI Format

```
tapmove://pay?id={payment_id}
```

Example: `tapmove://pay?id=pay_abc123xyz`

The app fetches full payment details from the backend using the ID.

## iOS Considerations

iOS has strict NFC limitations:
- No background tag reading
- Must explicitly call scan function
- Limited to certain tag types
- Requires entitlements in provisioning profile

### iOS Implementation
```typescript
import { Platform } from 'react-native';

async function startScan() {
  if (Platform.OS === 'ios') {
    // iOS requires explicit scan with native UI
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Hold near TapMove terminal'
    });
  } else {
    // Android can listen passively
    await NfcManager.registerTagEvent();
  }
}
```

## Error Handling

```typescript
const NFC_ERRORS = {
  NOT_SUPPORTED: 'NFC not supported on this device',
  NOT_ENABLED: 'NFC is disabled. Please enable in Settings.',
  TAG_LOST: 'Tag was removed too quickly',
  INVALID_TAG: 'Invalid payment tag',
  TIMEOUT: 'NFC scan timed out'
};
```

## Testing

### With NFC Tools App
1. Install "NFC Tools" from app store
2. Write a tag with URI: `tapmove://pay?id=test_123`
3. Test scanning with TapMove app

### Emulator Testing
NFC cannot be tested in emulators. Use physical devices.

## Best Practices

1. **Always handle unavailability** - Not all devices have NFC
2. **Provide QR fallback** - QR codes work everywhere
3. **Quick response** - Haptic/sound feedback on scan
4. **Clear instructions** - "Tap near terminal"
5. **Timeout handling** - Don't leave scan open forever
