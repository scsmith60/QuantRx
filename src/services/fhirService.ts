import FHIR from 'fhirclient';
import { ehrService } from './ehrService';

/**
 * QuantRx FHIR Service
 * Handles SMART on FHIR handshake and patient data ingestion.
 */

export const fhirService = {
  /**
   * Initializes the FHIR client (SMART on FHIR Handshake)
   */
  async init() {
    const config = ehrService.getConfig();
    if (config) {
        console.log(`[FHIR] Using saved bridge: ${config.vendorId} @ ${config.fhirBaseUrl}`);
    }

    try {
      const client = await FHIR.oauth2.ready();
      console.log("[FHIR] Client ready:", client.patient.id);
      return client;
    } catch (error) {
      console.warn("[FHIR] Handshake skipped or failed - using mock mode.");
      return null;
    }
  },

  /**
   * Mock schedule data seeded by organizationId to ensure practice isolation in the UI.
   */
  async getMockSchedule(organizationId?: string) {
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple deterministic seed from organizationId
    const seed = organizationId ? organizationId.split('-')[0] : 'default';
    const prefix = seed.toUpperCase().substring(0, 4);

    return [
      { 
        id: `pat-${seed}-001`, 
        name: `Patient (${prefix}-01A)`, 
        dob: "1978-XX-XX",
        payer: "Medicare B", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01", 
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",   
        remittancePayout: 3100.00, 
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: `${prefix}-01A`,
        isDeidentified: true
      },
      { 
        id: `pat-${seed}-002`, 
        name: `Patient (${prefix}-02B)`, 
        dob: "1985-XX-XX",
        payer: "Aetna PPO", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "Q5111", 
        recNdc: "00069-0322-03",   
        remittancePayout: 2950.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: `${prefix}-02B`,
        isDeidentified: true
      },
      { 
        id: `pat-${seed}-003`, 
        name: `Patient (${prefix}-03C)`, 
        dob: "1962-XX-XX",
        payer: "UnitedHealth", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",
        remittancePayout: 3050.00,
        specialty: 'oncology',
        isWhiteBagged: true,
        vaultId: `${prefix}-03C`,
        isDeidentified: true
      },
      {
        id: `pat-${seed}-004`,
        name: `Patient (${prefix}-04D)`,
        dob: "1984-XX-XX",
        payer: "Medicare B",
        orderHcpcs: "J9035",
        orderNdc: "00439-0110-01", 
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   
        remittancePayout: 3200.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: `${prefix}-04D`,
        isDeidentified: true
      },
      {
        id: `pat-${seed}-005`,
        name: `Patient (${prefix}-05E)`,
        dob: "1964-XX-XX",
        payer: "Blue Shield",
        orderHcpcs: "J1745",
        orderNdc: "00069-0322-04",
        recHcpcs: "Q5103",
        recNdc: "00069-0322-05",
        remittancePayout: 1820.00,
        specialty: 'gi',
        isWhiteBagged: true,
        vaultId: `${prefix}-05E`,
        isDeidentified: true
      }
    ];
  }
};
