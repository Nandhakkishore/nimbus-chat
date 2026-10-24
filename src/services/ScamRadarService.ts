import { ScamScanResult } from '../types';

export class ScamRadarService {
  private static PHISHING_KEYWORDS = [
    'urgent', 'verify account', 'bank transfer', 'crypto bonus', 'claim prize', 
    'otp code', 'password reset', 'wire money', 'gift card', 'suspicious activity',
    'click link immediately', 'lottery winner', 'cash prize'
  ];

  private static HOMOGLYPH_DOMAINS = [
    'micros0ft', 'paypa1', 'g00gle', 'amaz0n', 'app1e', 'humanl1nk', 'wellsfarg0'
  ];

  /**
   * Runs local client-side NLP & Link risk evaluation on inbound message text
   */
  public static scanMessageText(text: string, senderTrustScore: number): ScamScanResult {
    const lower = text.toLowerCase();
    const reasoning: string[] = [];
    let riskScore = 0.05;

    // Check Phishing Keywords
    let keywordHits = 0;
    for (const kw of this.PHISHING_KEYWORDS) {
      if (lower.includes(kw)) {
        keywordHits++;
        reasoning.push(`Contains high-risk trigger word: "${kw}"`);
      }
    }
    if (keywordHits > 0) {
      riskScore += keywordHits * 0.25;
    }

    // Check Homoglyph Links & IPs
    if (/https?:\/\/[^\s]+/.test(lower)) {
      riskScore += 0.2;
      reasoning.push('Contains external web hyperlink');
      
      for (const hg of this.HOMOGLYPH_DOMAINS) {
        if (lower.includes(hg)) {
          riskScore += 0.45;
          reasoning.push(`Detected spoofed homoglyph domain: "${hg}"`);
        }
      }

      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(lower)) {
        riskScore += 0.4;
        reasoning.push('Direct raw IP address URL (common in phishing)');
      }
    }

    // Factor in Sender Trust Score
    if (senderTrustScore < 30) {
      riskScore += 0.25;
      reasoning.push(`Sender has low Trust Graph rating (${senderTrustScore}/100)`);
    }

    riskScore = Math.min(0.99, Math.max(0.01, riskScore));
    const isSuspicious = riskScore >= 0.55;

    let category: ScamScanResult['category'] = 'clean';
    let recommendedAction: ScamScanResult['recommendedAction'] = 'allow';

    if (riskScore >= 0.75) {
      category = 'phishing';
      recommendedAction = 'block';
    } else if (riskScore >= 0.55) {
      category = lower.includes('wire') || lower.includes('bank') ? 'financial_fraud' : 'impersonation';
      recommendedAction = 'warn';
    }

    return {
      riskScore: parseFloat(riskScore.toFixed(2)),
      category,
      isSuspicious,
      reasoning: reasoning.length > 0 ? reasoning : ['No suspicious patterns detected. Verified clean.'],
      recommendedAction
    };
  }

  /**
   * Analyzes WebRTC call stream metadata for synthetic deepfake audio/video flags
   */
  public static evaluateDeepfakeCallRisk(jitterMs: number, fpsDropPct: number, audioFreqVariance: number): number {
    let risk = 10;
    if (jitterMs > 80) risk += 25;
    if (fpsDropPct > 40) risk += 30;
    if (audioFreqVariance < 0.15) risk += 25; // Synthetic voice lacks natural pitch variance
    return Math.min(98, risk);
  }
}
