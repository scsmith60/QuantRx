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
   * Mock schedule data with synthetic PHI fields (representing Vault-level data)
   */
  async getMockSchedule() {
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      { 
        id: 'pat-001', 
        name: "Patient (Vault-9921)", 
        dob: "1978-XX-XX",
        payer: "Medicare B", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01", 
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",   
        remittancePayout: 3100.00, 
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-9921',
        isDeidentified: true
      },
      { 
        id: 'pat-002', 
        name: "Patient (Vault-8812)", 
        dob: "1985-XX-XX",
        payer: "Aetna PPO", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "Q5111", 
        recNdc: "00069-0322-03",   
        remittancePayout: 2950.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-8812',
        isDeidentified: true
      },
      { 
        id: 'pat-003', 
        name: "Patient (Vault-7734)", 
        dob: "1962-XX-XX",
        payer: "UnitedHealth", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",
        remittancePayout: 3050.00,
        specialty: 'oncology',
        isWhiteBagged: true,
        vaultId: 'v-7734',
        isDeidentified: true
      },
      {
        id: 'pat-004',
        name: "Patient (Vault-6655)",
        dob: "1984-XX-XX",
        payer: "Medicare B",
        orderHcpcs: "J9035",
        orderNdc: "00439-0110-01", 
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   
        remittancePayout: 3200.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-6655',
        isDeidentified: true
      },
      {
        id: 'pat-005',
        name: "Patient (Vault-5544)",
        dob: "1964-XX-XX",
        payer: "Blue Shield",
        orderHcpcs: "J1745",
        orderNdc: "00069-0322-04",
        recHcpcs: "Q5103",
        recNdc: "00069-0322-05",
        remittancePayout: 1820.00,
        specialty: 'gi',
        isWhiteBagged: true,
        vaultId: 'v-5544',
        isDeidentified: true
      },
      {
        id: 'pat-006',
        name: "Patient (Vault-4433)",
        dob: "1972-XX-XX",
        payer: "Aetna PPO",
        orderHcpcs: "J9035",
        orderNdc: "00439-0110-01", 
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   
        remittancePayout: 3150.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-4433',
        isDeidentified: true
      },
      {
        id: 'pat-007',
        name: "Patient (Vault-3322)",
        dob: "1958-XX-XX",
        payer: "Aetna PPO",
        orderHcpcs: "Q5126",
        orderNdc: "70121-1754-01", 
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   
        remittancePayout: 680.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-3322',
        isDeidentified: true
      }
    ];
  }
};
