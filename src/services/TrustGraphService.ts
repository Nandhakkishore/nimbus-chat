import { TrustContext, RiskCategory } from '../types';

export class TrustGraphService {
  /**
   * Calculates real-time Trust Context for any given contact or unknown caller
   */
  public static calculateContext(
    mutualContactsCount: number,
    sharedGroups: number,
    accountAgeMonths: number,
    spamReportCount: number,
    country: string
  ): TrustContext {
    // Determine connection degree
    let connectionDegree: 1 | 2 | 3 = 3;
    if (mutualContactsCount > 5) {
      connectionDegree = 1;
    } else if (mutualContactsCount > 0 || sharedGroups > 0) {
      connectionDegree = 2;
    }

    // Formula: W1 * Degree + W2 * Groups + W3 * Age - W4 * Reports
    let baseScore = 30;
    if (connectionDegree === 1) baseScore += 45;
    else if (connectionDegree === 2) baseScore += 25;

    baseScore += Math.min(20, sharedGroups * 5);
    baseScore += Math.min(15, accountAgeMonths * 1.5);
    baseScore -= spamReportCount * 25;

    const trustScore = Math.min(100, Math.max(5, Math.round(baseScore)));

    let riskCategory: RiskCategory = 'low';
    if (trustScore < 30) riskCategory = 'suspicious';
    else if (trustScore < 50) riskCategory = 'high';
    else if (trustScore < 70) riskCategory = 'moderate';

    return {
      trustScore,
      connectionDegree,
      sharedGroups,
      country,
      mutualContactsCount,
      riskCategory
    };
  }
}
