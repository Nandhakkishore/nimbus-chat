import { DeviceKey } from '../types';

export class E2EEService {
  /**
   * Generates a 30-digit formatted E2EE Safety Number from two device fingerprints
   */
  public static generateSafetyNumber(myFingerprint: string, peerFingerprint: string): string {
    const combined = myFingerprint < peerFingerprint 
      ? myFingerprint + peerFingerprint 
      : peerFingerprint + myFingerprint;
    
    // Hash simulation to 6 blocks of 5 digits
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0;
    }
    
    const seed = Math.abs(hash).toString().padStart(12, '9');
    const blocks: string[] = [];
    for (let i = 0; i < 6; i++) {
      const part = ((parseInt(seed) * (i + 1) * 31) % 90000 + 10000).toString();
      blocks.push(part);
    }
    return blocks.join(' ');
  }

  /**
   * Generates a device-bound QR Code verification payload string
   */
  public static generateQRPayload(userPhone: string, deviceKey: DeviceKey): string {
    return JSON.stringify({
      v: 1,
      app: 'HumanLink',
      phone: userPhone,
      deviceId: deviceKey.deviceId,
      fp: deviceKey.fingerprint,
      safety: deviceKey.safetyNumber,
      ts: Date.now()
    });
  }

  /**
   * Verifies an incoming QR payload against known device key
   */
  public static verifyQRPayload(qrData: string, expectedSafetyNumber: string): boolean {
    try {
      const parsed = JSON.parse(qrData);
      return parsed.app === 'HumanLink' && parsed.safety === expectedSafetyNumber;
    } catch (err) {
      return false;
    }
  }

  /**
   * Simulates Double Ratchet payload encryption
   */
  public static encryptPayload(plaintext: string): { ciphertext: string; ratchetIndex: number } {
    const base64 = btoa(unescape(encodeURIComponent(plaintext)));
    return {
      ciphertext: `HL_E2EE::v1::${base64}::sig_${Math.floor(Math.random() * 900000 + 100000)}`,
      ratchetIndex: Math.floor(Math.random() * 50) + 1
    };
  }
}
