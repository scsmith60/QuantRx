import { ingestionHarvester } from './ingestionHarvester';

/**
 * EDI 835 Parser Logic
 * Simulates a Deno Edge Function that processes claims advice files.
 */

export const claimIngestor = {
  /**
   * Processes an 835 EDI file.
   */
  async process835(file: File) {
    console.log(`[835Parser] Processing EDI file: ${file.name}`);
    
    // Delegate to harvester
    const result = await ingestionHarvester.process835(file);
    
    return {
      processed: true,
      claimsCount: result.recordsProcessed,
      attributionsFound: result.matchesFound, 
      matchedVolume: result.matchedRevenue,
      platformFees: result.platformFees
    };
  }
};

