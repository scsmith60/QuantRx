import { attributionEngine } from './attributionEngine';

/**
 * Switch Detector Service
 * Periodically polls the EHR (via FHIR) to detect switches that match our recommendations.
 */

export const switchDetector = {
  /**
   * Starts a background polling process to detect switches.
   */
  startMonitoring() {
    console.log("[Detector] Background monitoring started...");
    
    // In a real app, this would be a FHIR Subscription or a periodic job.
    // For this simulation, we'll wait 15 seconds and then "detect" a switch that wasn't clicked.
    setTimeout(async () => {
      console.log("[Detector] Running audit scan...");
      
      // Simulate detecting a switch for patient 'pat-003' (Robert Brown) 
      // who was recommended Armlupeg (ARML).
      const result = attributionEngine.detectSwitch('pat-003', 'ARML');
      
      if (result) {
        console.log("[Detector] ALERT: Found un-applied switch for pat-003. Revenue attributed.");
      }
    }, 15000);
  }
};
