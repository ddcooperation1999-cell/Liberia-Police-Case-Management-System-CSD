/**
 * Court System Integration
 * Handles communication with external court case management systems
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * Court System Types
 */
const CourtSystemTypes = {
  FEDERAL: 'federal',
  STATE: 'state',
  COUNTY: 'county',
  MUNICIPAL: 'municipal'
};

/**
 * Case Status Mappings
 */
const CourtStatusMappings = {
  'filed': 'case_filed',
  'pending_hearing': 'hearing_scheduled',
  'hearing_held': 'hearing_completed',
  'verdict_pending': 'awaiting_verdict',
  'verdict_delivered': 'verdict_received',
  'sentencing_pending': 'awaiting_sentencing',
  'sentenced': 'sentenced',
  'appealed': 'appealed',
  'appeal_denied': 'appeal_denied',
  'closed': 'case_closed'
};

/**
 * Initialize court system client
 */
const createCourtClient = (config) => {
  const {
    apiUrl,
    apiKey,
    courtId,
    jurisdiction
  } = config;

  if (!apiUrl || !apiKey) {
    throw new Error('Court API configuration missing (apiUrl, apiKey)');
  }

  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Court-ID': courtId,
      'User-Agent': 'LNP-Case-Management/1.0'
    },
    timeout: 30000
  });

  // Add signature middleware for secure requests
  client.interceptors.request.use((config) => {
    const timestamp = Date.now();
    const signature = generateSignature(apiKey, timestamp);
    
    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Signature'] = signature;
    
    return config;
  });

  return {
    client,
    apiUrl,
    courtId,
    jurisdiction
  };
};

/**
 * Generate HMAC signature for court API requests
 */
const generateSignature = (apiKey, timestamp) => {
  return crypto
    .createHmac('sha256', apiKey)
    .update(timestamp.toString())
    .digest('hex');
};

/**
 * Search court cases
 */
const searchCourtCases = async (courtClient, searchCriteria) => {
  try {
    const { defendant, caseNumber, filingDate, courtType } = searchCriteria;

    const response = await courtClient.client.post('/cases/search', {
      defendant,
      case_number: caseNumber,
      filing_date: filingDate,
      court_type: courtType,
      jurisdiction: courtClient.jurisdiction
    });

    return {
      success: true,
      cases: response.data.results || [],
      total: response.data.total || 0
    };
  } catch (err) {
    console.error('Error searching court cases:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to search court cases',
      cases: []
    };
  }
};

/**
 * Get detailed case information from court system
 */
const getCourtCaseDetails = async (courtClient, caseNumber) => {
  try {
    const response = await courtClient.client.get(`/cases/${caseNumber}`);

    return {
      success: true,
      case: {
        caseNumber: response.data.case_number,
        title: response.data.title,
        defendant: response.data.defendant,
        plaintiff: response.data.plaintiff,
        attorney: response.data.attorney,
        judge: response.data.judge,
        filingDate: response.data.filing_date,
        nextHearingDate: response.data.next_hearing_date,
        status: response.data.status,
        charges: response.data.charges || [],
        documents: response.data.documents || [],
        hearings: response.data.hearings || [],
        verdictDate: response.data.verdict_date,
        verdict: response.data.verdict
      }
    };
  } catch (err) {
    console.error('Error getting court case details:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to get case details'
    };
  }
};

/**
 * Get case history and timeline
 */
const getCourtCaseHistory = async (courtClient, caseNumber) => {
  try {
    const response = await courtClient.client.get(`/cases/${caseNumber}/history`);

    return {
      success: true,
      history: (response.data.events || []).map(event => ({
        date: event.date,
        event_type: event.type,
        description: event.description,
        court_official: event.official,
        notes: event.notes
      }))
    };
  } catch (err) {
    console.error('Error getting case history:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to get case history'
    };
  }
};

/**
 * Get hearing schedule
 */
const getCourtHearingSchedule = async (courtClient, caseNumber) => {
  try {
    const response = await courtClient.client.get(`/cases/${caseNumber}/hearings`);

    return {
      success: true,
      hearings: (response.data.hearings || []).map(hearing => ({
        hearingId: hearing.hearing_id,
        date: hearing.date,
        time: hearing.time,
        room: hearing.room,
        judge: hearing.judge,
        type: hearing.type,
        status: hearing.status,
        notes: hearing.notes
      }))
    };
  } catch (err) {
    console.error('Error getting hearing schedule:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to get hearing schedule'
    };
  }
};

/**
 * File court documents
 */
const fileCourtDocument = async (courtClient, caseNumber, document) => {
  try {
    const formData = new FormData();
    formData.append('case_number', caseNumber);
    formData.append('document_type', document.type);
    formData.append('document_name', document.name);
    formData.append('file', document.file);
    formData.append('filed_by', document.filedBy);
    formData.append('description', document.description || '');

    const response = await courtClient.client.post('/documents/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      documentId: response.data.document_id,
      filingDate: response.data.filing_date,
      status: response.data.status
    };
  } catch (err) {
    console.error('Error filing court document:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to file document'
    };
  }
};

/**
 * Get case verdict and sentencing information
 */
const getCourtVerdictInfo = async (courtClient, caseNumber) => {
  try {
    const response = await courtClient.client.get(`/cases/${caseNumber}/verdict`);

    return {
      success: true,
      verdict: {
        date: response.data.date,
        verdict: response.data.verdict,
        judge: response.data.judge,
        notes: response.data.notes,
        sentencing: {
          date: response.data.sentencing_date,
          sentence: response.data.sentence,
          length: response.data.sentence_length,
          unit: response.data.sentence_unit, // 'months', 'years', etc
          conditions: response.data.conditions || []
        },
        appeal: response.data.appeal_filed ? {
          filed_date: response.data.appeal_filed_date,
          status: response.data.appeal_status,
          court: response.data.appeal_court
        } : null
      }
    };
  } catch (err) {
    console.error('Error getting verdict info:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to get verdict information'
    };
  }
};

/**
 * Sync court case data to police database
 */
const syncCourtCaseToPoliceDB = async (courtCaseData, db) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE police_cases 
      SET 
        court_case_number = ?,
        court_status = ?,
        next_hearing_date = ?,
        verdict = ?,
        sentencing_info = ?,
        synced_at = CURRENT_TIMESTAMP
      WHERE case_number = ?
    `;

    const params = [
      courtCaseData.caseNumber,
      CourtStatusMappings[courtCaseData.status] || courtCaseData.status,
      courtCaseData.nextHearingDate,
      courtCaseData.verdict || null,
      JSON.stringify(courtCaseData.sentencing || {}),
      courtCaseData.policeRefNumber
    ];

    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          success: true,
          message: 'Court case data synced to police database'
        });
      }
    });
  });
};

/**
 * Get court case status mapping
 */
const mapCourtStatusToPoliceStatus = (courtStatus) => {
  return CourtStatusMappings[courtStatus.toLowerCase()] || courtStatus;
};

/**
 * Create mock court client for testing
 */
const createMockCourtClient = (jurisdiction = 'state') => {
  return {
    client: axios.create({
      baseURL: 'https://mock-court-api.local',
      headers: {
        'Authorization': 'Bearer mock-key'
      }
    }),
    apiUrl: 'https://mock-court-api.local',
    courtId: 'MOCK-001',
    jurisdiction
  };
};

module.exports = {
  CourtSystemTypes,
  CourtStatusMappings,
  createCourtClient,
  generateSignature,
  searchCourtCases,
  getCourtCaseDetails,
  getCourtCaseHistory,
  getCourtHearingSchedule,
  fileCourtDocument,
  getCourtVerdictInfo,
  syncCourtCaseToPoliceDB,
  mapCourtStatusToPoliceStatus,
  createMockCourtClient
};
