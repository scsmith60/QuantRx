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
        name: "John Doe", 
        dob: "1978-05-12",
        payer: "Medicare B", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01", // Neulasta
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",   // Armlupeg
        remittancePayout: 3100.00, // The "Bill"
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-9921'
      },
      { 
        id: 'pat-002', 
        name: "Jane Smith", 
        dob: "1985-11-20",
        payer: "Aetna PPO", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "Q5111", 
        recNdc: "00069-0322-03",   // Udenyca
        remittancePayout: 2950.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-8812'
      },
      { 
        id: 'pat-003', 
        name: "Robert Brown", 
        dob: "1962-02-05",
        payer: "UnitedHealth", 
        orderHcpcs: "J2506", 
        orderNdc: "00069-0322-01",
        recHcpcs: "J1447", 
        recNdc: "00069-0322-02",
        remittancePayout: 3050.00,
        specialty: 'oncology',
        isWhiteBagged: true,
        vaultId: 'v-7734'
      },
      {
        id: 'pat-004',
        name: "Sarah Connor",
        dob: "1984-05-12",
        payer: "Medicare B",
        orderHcpcs: "J9035",
        orderNdc: "00439-0110-01", // Avastin
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   // Alymsys
        remittancePayout: 3200.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-6655'
      },
      {
        id: 'pat-005',
        name: "Michael Scott",
        dob: "1964-03-15",
        payer: "Blue Shield",
        orderHcpcs: "J1745",
        orderNdc: "00069-0322-04",
        recHcpcs: "Q5103",
        recNdc: "00069-0322-05",
        remittancePayout: 1820.00,
        specialty: 'gi',
        isWhiteBagged: true,
        vaultId: 'v-5544'
      },
      {
        id: 'pat-006',
        name: "Alice Williams",
        dob: "1972-08-22",
        payer: "Aetna PPO",
        orderHcpcs: "J9035",
        orderNdc: "00439-0110-01", // Avastin
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   // Alymsys
        remittancePayout: 3150.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-4433'
      },
      {
        id: 'pat-007',
        name: "James Taylor",
        dob: "1958-12-05",
        payer: "Aetna PPO",
        orderHcpcs: "Q5126",
        orderNdc: "70121-1754-01", // Alymsys
        recHcpcs: "Q5126",
        recNdc: "70121-1754-01",   
        remittancePayout: 680.00,
        specialty: 'oncology',
        isWhiteBagged: false,
        vaultId: 'v-3322'
      }
    ];
  }
};
