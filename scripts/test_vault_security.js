import { vaultSecurity } from '../src/services/vaultSecurity';

async function testHashing() {
    const practiceSalt = "test-salt-123";
    const patient = {
        firstName: "John",
        lastName: "Doe",
        dob: "1980-01-01",
        memberId: "MEM-999"
    };

    console.log("--- QuantRx Vault Security Test ---");
    
    const hash1 = await vaultSecurity.hashPatientIdentity(patient, practiceSalt);
    console.log(`Hash 1: ${hash1}`);
    
    const hash2 = await vaultSecurity.hashPatientIdentity(patient, practiceSalt);
    console.log(`Hash 2: ${hash2}`);

    if (hash1 === hash2) {
        console.log("SUCCESS: Hashing is deterministic.");
    } else {
        console.error("FAILURE: Hashing is NOT deterministic!");
    }

    const patientDifferent = { ...patient, firstName: "john" }; // Lowercase check
    const hash3 = await vaultSecurity.hashPatientIdentity(patientDifferent, practiceSalt);
    
    if (hash1 === hash3) {
        console.log("SUCCESS: Hashing is case-insensitive.");
    } else {
        console.warn("WARNING: Hashing is case-sensitive (check implementation).");
    }
}

// Note: This script is intended to be run in a browser context or with a web-crypto polyfill.
// Since we are in a Node-like environment for tests, it may need adjustment.
testHashing();
