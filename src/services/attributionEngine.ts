/**
 * Attribution Engine
 * Tracks recommendation intent and detects switches in the EHR/claims.
 */

export interface AttributionRecord {
  patientId: string;
  recommendedHcpcs: string;
  originalHcpcs: string;
  detectedHcpcs?: string;
  status: 'Pending' | 'Attributed' | 'Ignored';
  timestamp: Date;
}

// Mock database for intent tracking
const intentRegistry: Map<string, AttributionRecord> = new Map();

export const attributionEngine = {
  /**
   * Logs a recommendation given to a provider.
   */
  logIntent(patientId: string, originalHcpcs: string, recommendedHcpcs: string) {
    intentRegistry.set(patientId, {
      patientId,
      originalHcpcs,
      recommendedHcpcs,
      status: 'Pending',
      timestamp: new Date()
    });
    console.log(`[Attribution] Intent logged for patient ${patientId}: ${originalHcpcs} -> ${recommendedHcpcs}`);
  },

  /**
   * Checks for a switch in the EHR or Claim data.
   * If the currentHcpcs matches our recommendation, we claim attribution.
   */
  detectSwitch(patientId: string, actualHcpcs: string): AttributionRecord | null {
    const record = intentRegistry.get(patientId);
    
    if (!record) return null;
    
    if (record.status === 'Pending' && actualHcpcs === record.recommendedHcpcs) {
      record.status = 'Attributed';
      record.detectedHcpcs = actualHcpcs;
      console.log(`[Attribution] SUCCESS: Switch detected for patient ${patientId} match recommendation ${record.recommendedHcpcs}`);
      return record;
    }
    
    return null;
  },

  /**
   * Returns all attributed switches for the Admin Console.
   */
  getAttributions() {
    return Array.from(intentRegistry.values()).filter(r => r.status === 'Attributed');
  }
};
