/**
 * QuantRx EHR Service
 * Handles SMART on FHIR integrations for major EHR vendors.
 */

export interface EHRVendor {
  id: string;
  name: string;
  logoColor: string;
  fhirBaseUrl: string;
  authorizeUrl?: string; // For real OAuth2 handshakes
  tokenUrl?: string;
  clientIdPlaceholder: string;
  sandboxInfo: string;
}

export const EHR_VENDORS: EHRVendor[] = [
  {
    id: 'epic',
    name: 'Epic Hyperdrive',
    logoColor: 'text-[#C7000B]',
    fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/',
    authorizeUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    clientIdPlaceholder: 'e.g. 56262a71-6789-4672-9112-61261621621',
    sandboxInfo: 'Epic App Orchard Sandbox - requires a valid Client ID for testing.'
  },
  {
    id: 'cerner',
    name: 'Oracle Cerner Millennium',
    logoColor: 'text-[#005CB9]',
    fhirBaseUrl: 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/',
    authorizeUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/patient/authorize',
    tokenUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token',
    clientIdPlaceholder: 'e.g. 70000000-0000-0000-0000-000000000000',
    sandboxInfo: 'Cerner Open Sandbox - pre-configured for public tenant testing.'
  },
  {
    id: 'pcc',
    name: 'PointClickCare',
    logoColor: 'text-[#F58220]',
    fhirBaseUrl: 'https://sandbox.pointclickcare.com/fhir/R4/',
    clientIdPlaceholder: 'e.g. pcc-api-key-12345',
    sandboxInfo: 'PointClickCare Sandbox - specialized for long-term care data.'
  },
  {
    id: 'allscripts',
    name: 'Altera (Allscripts)',
    logoColor: 'text-[#008295]',
    fhirBaseUrl: 'https://fhir.allscripts.com/fhir/R4/',
    clientIdPlaceholder: 'e.g. allscripts-client-abc',
    sandboxInfo: 'Allscripts FHIR Sandbox - requires developer portal registration.'
  }
];

export interface EHRConnectionConfig {
  vendorId: string;
  clientId: string;
  clientSecret?: string;
  fhirBaseUrl: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export const ehrService = {
  /**
   * Mocks a SMART on FHIR handshake
   */
  async testConnection(config: EHRConnectionConfig): Promise<{ success: boolean; message: string }> {
    console.log(`[EHR] Testing connection to ${config.vendorId} at ${config.fhirBaseUrl}...`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Basic validation
    if (!config.clientId) {
      return { success: false, message: "Client ID is required for FHIR handshake." };
    }
    
    // Successful mock connection
    return { 
      success: true, 
      message: `Successfully established SMART on FHIR bridge with ${config.vendorId}. Metadata received.` 
    };
  },

  /**
   * Persists the EHR configuration (mock)
   */
  async saveConfig(config: EHRConnectionConfig): Promise<void> {
    localStorage.setItem('quantrx_ehr_config', JSON.stringify(config));
    console.log("[EHR] Configuration saved:", config);
  },

  /**
   * Gets the active EHR configuration
   */
  getConfig(): EHRConnectionConfig | null {
    const saved = localStorage.getItem('quantrx_ehr_config');
    return saved ? JSON.parse(saved) : null;
  }
};
