// NFC Feedback - Haptic and sound feedback for NFC events
import * as Haptics from 'expo-haptics';

/**
 * Trigger haptic feedback when NFC tag is detected
 */
export async function onTagDetected(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('[NFC Feedback] Haptic failed:', error);
  }
}

/**
 * Trigger haptic feedback for successful payment
 */
export async function onPaymentSuccess(): Promise<void> {
  try {
    // Double haptic for success
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
  } catch (error) {
    console.warn('[NFC Feedback] Haptic failed:', error);
  }
}

/**
 * Trigger haptic feedback for payment error
 */
export async function onPaymentError(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn('[NFC Feedback] Haptic failed:', error);
  }
}

/**
 * Light haptic for starting to listen
 */
export async function onListeningStart(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('[NFC Feedback] Haptic failed:', error);
  }
}

/**
 * Haptic for warnings (NFC disabled, etc.)
 */
export async function onWarning(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.warn('[NFC Feedback] Haptic failed:', error);
  }
}

export const nfcFeedback = {
  onTagDetected,
  onPaymentSuccess,
  onPaymentError,
  onListeningStart,
  onWarning,
};
