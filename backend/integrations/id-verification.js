/**
 * ID Verification System Integration
 * Handles integration with government ID databases and biometric verification services
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * ID Verification Providers
 */
const IDVerificationProviders = {
  GOVERNMENT_DATABASE: 'government_database',
  FACIAL_RECOGNITION: 'facial_recognition',
  FINGERPRINT_SYSTEM: 'fingerprint_system',
  DOCUMENT_VERIFICATION: 'document_verification',
  MULTI_MODAL: 'multi_modal'
};

/**
 * Verification Status
 */
const VerificationStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  VERIFIED: 'verified',
  FAILED: 'failed',
  SUSPICIOUS: 'suspicious',
  EXPIRED: 'expired'
};

/**
 * Initialize ID verification client
 */
const createIDVerificationClient = (config) => {
  const {
    apiUrl,
    apiKey,
    provider = 'government_database',
    timeout = 30000
  } = config;

  if (!apiUrl || !apiKey) {
    throw new Error('ID Verification configuration missing (apiUrl, apiKey)');
  }

  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'LNP-Case-Management/1.0'
    },
    timeout
  });

  return {
    client,
    apiUrl,
    provider,
    apiKey
  };
};

/**
 * Verify person by government ID
 */
const verifyGovernmentID = async (verificationClient, personData) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      governmentId,
      idType = 'national_id' // national_id, passport, license, etc
    } = personData;

    const response = await verificationClient.client.post('/verify/government-id', {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      government_id: governmentId,
      id_type: idType,
      check_criminal_status: true
    });

    return {
      success: true,
      verified: response.data.verified,
      status: response.data.status,
      matchScore: response.data.match_score,
      personDetails: {
        fullName: response.data.full_name,
        dateOfBirth: response.data.date_of_birth,
        address: response.data.address,
        phoneNumber: response.data.phone_number,
        email: response.data.email
      },
      criminalStatus: response.data.criminal_record ? {
        hasCriminalRecord: true,
        recordCount: response.data.criminal_record.count,
        lastRecordDate: response.data.criminal_record.last_date,
        convictions: response.data.criminal_record.convictions || []
      } : {
        hasCriminalRecord: false
      },
      verification: {
        verificationId: response.data.verification_id,
        timestamp: response.data.timestamp,
        expiresAt: response.data.expires_at,
        verifier: response.data.verifier_id
      }
    };
  } catch (err) {
    console.error('Error verifying government ID:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to verify government ID',
      verified: false
    };
  }
};

/**
 * Verify person by facial recognition
 */
const verifyFacialRecognition = async (verificationClient, photoData) => {
  try {
    const {
      photo, // base64 or file
      referenceFaceId = null, // existing face in system
      confidenceThreshold = 0.95
    } = photoData;

    const formData = new FormData();
    formData.append('photo', photo);
    if (referenceFaceId) {
      formData.append('reference_face_id', referenceFaceId);
    }
    formData.append('confidence_threshold', confidenceThreshold);

    const response = await verificationClient.client.post(
      '/verify/facial-recognition',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      success: true,
      verified: response.data.verified,
      status: response.data.status,
      confidenceScore: response.data.confidence_score,
      faceData: {
        faceId: response.data.face_id,
        landmarks: response.data.landmarks,
        attributes: response.data.attributes
      },
      verification: {
        verificationId: response.data.verification_id,
        timestamp: response.data.timestamp
      }
    };
  } catch (err) {
    console.error('Error verifying facial recognition:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to verify facial recognition',
      verified: false
    };
  }
};

/**
 * Verify fingerprints
 */
const verifyFingerprints = async (verificationClient, fingerprintData) => {
  try {
    const {
      fingerprintImage, // base64 or file
      fingerprintTemplate = null,
      matchThreshold = 0.98,
      quality = 'high'
    } = fingerprintData;

    const formData = new FormData();
    formData.append('fingerprint_image', fingerprintImage);
    if (fingerprintTemplate) {
      formData.append('template', fingerprintTemplate);
    }
    formData.append('match_threshold', matchThreshold);
    formData.append('quality', quality);

    const response = await verificationClient.client.post(
      '/verify/fingerprints',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      success: true,
      verified: response.data.verified,
      status: response.data.status,
      matchScore: response.data.match_score,
      fingerprintData: {
        fingerprintId: response.data.fingerprint_id,
        quality: response.data.quality_score,
        minuatiae: response.data.minutiae_count
      },
      verification: {
        verificationId: response.data.verification_id,
        timestamp: response.data.timestamp
      }
    };
  } catch (err) {
    console.error('Error verifying fingerprints:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to verify fingerprints',
      verified: false
    };
  }
};

/**
 * Document verification (ID card, passport, license)
 */
const verifyDocument = async (verificationClient, documentData) => {
  try {
    const {
      documentType, // 'id_card', 'passport', 'license'
      documentImage,
      backSideImage = null,
      checkExpiry = true,
      checkAuthenticity = true
    } = documentData;

    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('front_image', documentImage);
    if (backSideImage) {
      formData.append('back_image', backSideImage);
    }
    formData.append('check_expiry', checkExpiry);
    formData.append('check_authenticity', checkAuthenticity);

    const response = await verificationClient.client.post(
      '/verify/document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      success: true,
      verified: response.data.verified,
      status: response.data.status,
      documentDetails: {
        documentNumber: response.data.document_number,
        fullName: response.data.full_name,
        dateOfBirth: response.data.date_of_birth,
        issuedDate: response.data.issued_date,
        expiryDate: response.data.expiry_date,
        isExpired: response.data.is_expired,
        issueCountry: response.data.issue_country
      },
      authenticityScore: response.data.authenticity_score,
      qualityScore: response.data.quality_score,
      verification: {
        verificationId: response.data.verification_id,
        timestamp: response.data.timestamp
      }
    };
  } catch (err) {
    console.error('Error verifying document:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to verify document',
      verified: false
    };
  }
};

/**
 * Multi-modal verification (combine multiple verification methods)
 */
const verifyMultiModal = async (verificationClient, multiData) => {
  try {
    const {
      governmentId,
      photoImage,
      fingerprintImage,
      documentImage,
      requiredConfidence = 0.95
    } = multiData;

    const formData = new FormData();
    formData.append('government_id', governmentId);
    if (photoImage) formData.append('photo_image', photoImage);
    if (fingerprintImage) formData.append('fingerprint_image', fingerprintImage);
    if (documentImage) formData.append('document_image', documentImage);
    formData.append('required_confidence', requiredConfidence);

    const response = await verificationClient.client.post(
      '/verify/multi-modal',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return {
      success: true,
      verified: response.data.verified,
      overallScore: response.data.overall_score,
      status: response.data.status,
      results: {
        governmentId: response.data.results.government_id,
        facial: response.data.results.facial,
        fingerprint: response.data.results.fingerprint,
        document: response.data.results.document
      },
      verification: {
        verificationId: response.data.verification_id,
        timestamp: response.data.timestamp,
        expiresAt: response.data.expires_at
      },
      warnings: response.data.warnings || []
    };
  } catch (err) {
    console.error('Error in multi-modal verification:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to complete multi-modal verification',
      verified: false
    };
  }
};

/**
 * Get verification history
 */
const getVerificationHistory = async (verificationClient, governmentId) => {
  try {
    const response = await verificationClient.client.get(
      `/verification-history/${governmentId}`
    );

    return {
      success: true,
      history: (response.data.verifications || []).map(v => ({
        verificationId: v.verification_id,
        date: v.date,
        type: v.type,
        status: v.status,
        method: v.method,
        score: v.score,
        verifier: v.verifier_id
      }))
    };
  } catch (err) {
    console.error('Error getting verification history:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to get verification history'
    };
  }
};

/**
 * Save verification to police database
 */
const saveVerificationToPoliceDB = async (verificationData, db) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO suspect_verifications (
        suspect_id, verification_type, verification_status, 
        verification_score, verification_data, verified_at, verifier_id
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `;

    const params = [
      verificationData.suspectId,
      verificationData.verificationType,
      verificationData.status,
      verificationData.score,
      JSON.stringify(verificationData.data),
      verificationData.verifierId || 'system'
    ];

    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          success: true,
          message: 'Verification saved to police database'
        });
      }
    });
  });
};

/**
 * Create mock verification client for testing
 */
const createMockIDVerificationClient = (provider = 'government_database') => {
  return {
    client: axios.create({
      baseURL: 'https://mock-id-verification.local',
      headers: {
        'Authorization': 'Bearer mock-key'
      }
    }),
    apiUrl: 'https://mock-id-verification.local',
    provider,
    apiKey: 'mock-key'
  };
};

module.exports = {
  IDVerificationProviders,
  VerificationStatus,
  createIDVerificationClient,
  verifyGovernmentID,
  verifyFacialRecognition,
  verifyFingerprints,
  verifyDocument,
  verifyMultiModal,
  getVerificationHistory,
  saveVerificationToPoliceDB,
  createMockIDVerificationClient
};
