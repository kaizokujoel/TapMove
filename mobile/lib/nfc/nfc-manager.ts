// NFC Manager - Handles NFC tag reading and payment detection
import NfcManager, { NfcTech, Ndef, NfcEvents, TagEvent } from 'react-native-nfc-manager';
import { Platform } from 'react-native';

export type NfcStatus = 'unsupported' | 'disabled' | 'ready' | 'listening';

export interface NfcState {
  isSupported: boolean;
  isEnabled: boolean;
  isListening: boolean;
  status: NfcStatus;
}

const TAPMOVE_SCHEME = 'tapmove://pay';

class TapMoveNfcManager {
  private isInitialized = false;
  private tagListener: ((paymentId: string) => void) | null = null;

  /**
   * Initialize NFC Manager
   * Returns true if NFC is supported and initialized
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const supported = await NfcManager.isSupported();
      if (!supported) {
        return false;
      }

      await NfcManager.start();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('[NFC] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if NFC is supported on this device
   */
  async isSupported(): Promise<boolean> {
    try {
      return await NfcManager.isSupported();
    } catch {
      return false;
    }
  }

  /**
   * Check if NFC is enabled in device settings
   */
  async isEnabled(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get current NFC state
   */
  async getState(): Promise<NfcState> {
    const isSupported = await this.isSupported();
    const isEnabled = isSupported ? await this.isEnabled() : false;

    let status: NfcStatus;
    if (!isSupported) {
      status = 'unsupported';
    } else if (!isEnabled) {
      status = 'disabled';
    } else {
      status = 'ready';
    }

    return {
      isSupported,
      isEnabled,
      isListening: false,
      status,
    };
  }

  /**
   * Start listening for NFC tags (Android foreground dispatch)
   */
  async startListening(onPaymentDetected: (paymentId: string) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.tagListener = onPaymentDetected;

    // Set up tag discovery event listener
    NfcManager.setEventListener(NfcEvents.DiscoverTag, this.handleTagDiscovered);

    // Register for tag events
    await NfcManager.registerTagEvent();
  }

  /**
   * Stop listening for NFC tags
   */
  async stopListening(): Promise<void> {
    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      await NfcManager.unregisterTagEvent();
      this.tagListener = null;
    } catch (error) {
      console.error('[NFC] Error stopping listener:', error);
    }
  }

  /**
   * Handle discovered NFC tag
   */
  private handleTagDiscovered = (tag: TagEvent) => {
    try {
      const uri = this.extractUriFromTag(tag);
      if (uri) {
        const paymentId = this.parsePaymentUri(uri);
        if (paymentId && this.tagListener) {
          this.tagListener(paymentId);
        }
      }
    } catch (error) {
      console.error('[NFC] Error processing tag:', error);
    }
  };

  /**
   * Extract URI from NDEF message in tag
   */
  private extractUriFromTag(tag: TagEvent): string | null {
    const ndefRecords = tag.ndefMessage;
    if (!ndefRecords || ndefRecords.length === 0) {
      return null;
    }

    for (const record of ndefRecords) {
      // Check for URI record (TNF_WELL_KNOWN with RTD_URI)
      if (record.tnf === Ndef.TNF_WELL_KNOWN) {
        try {
          const payload = record.payload;
          if (payload && payload.length > 0) {
            const uri = Ndef.uri.decodePayload(payload as any);
            return uri;
          }
        } catch {
          // Try as text record
          try {
            const text = Ndef.text.decodePayload(record.payload as any);
            if (text.startsWith(TAPMOVE_SCHEME)) {
              return text;
            }
          } catch {
            // Not a text record either
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse payment URI to extract payment ID
   * Format: tapmove://pay?id={payment_id}
   */
  parsePaymentUri(uri: string): string | null {
    if (!uri.startsWith(TAPMOVE_SCHEME)) {
      return null;
    }

    try {
      // Parse the URI
      const url = new URL(uri);
      const paymentId = url.searchParams.get('id');
      return paymentId;
    } catch {
      // Fallback: manual parsing
      const match = uri.match(/id=([^&]+)/);
      return match ? match[1] : null;
    }
  }

  /**
   * iOS-specific: Start explicit scan session
   * iOS doesn't support background NFC, must use explicit scan
   */
  async startIosScan(onPaymentDetected: (paymentId: string) => void): Promise<void> {
    if (Platform.OS !== 'ios') {
      return this.startListening(onPaymentDetected);
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your phone near the TapMove terminal',
      });

      const tag = await NfcManager.getTag();
      if (tag) {
        const uri = this.extractUriFromTag(tag);
        if (uri) {
          const paymentId = this.parsePaymentUri(uri);
          if (paymentId) {
            onPaymentDetected(paymentId);
          }
        }
      }
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
  }

  /**
   * Open device NFC settings
   */
  async goToNfcSettings(): Promise<void> {
    try {
      await NfcManager.goToNfcSetting();
    } catch (error) {
      console.error('[NFC] Failed to open settings:', error);
    }
  }

  /**
   * Cleanup - call when app is closing
   */
  async cleanup(): Promise<void> {
    await this.stopListening();
    this.isInitialized = false;
  }
}

// Singleton instance
export const nfcManager = new TapMoveNfcManager();
