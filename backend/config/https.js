/**
 * HTTPS and TLS Configuration
 * Handles SSL certificate management for production environments
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Load SSL certificates from filesystem
 * In production, these should be managed by your deployment environment
 * (AWS ACM, Azure KeyVault, or your hosting provider)
 */
const loadSSLCertificates = () => {
  const certPath = process.env.SSL_CERT_PATH;
  const keyPath = process.env.SSL_KEY_PATH;

  if (!certPath || !keyPath) {
    console.warn('SSL_CERT_PATH and SSL_KEY_PATH not set. HTTPS disabled.');
    return null;
  }

  try {
    const cert = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');
    return { cert, key };
  } catch (err) {
    console.error('Error loading SSL certificates:', err.message);
    return null;
  }
};

/**
 * Create HTTPS server with proper TLS configuration
 */
const createHTTPSServer = (app) => {
  const ssl = loadSSLCertificates();

  if (!ssl) {
    console.log('Running in HTTP mode. For production, configure HTTPS.');
    return null;
  }

  const httpsOptions = {
    cert: ssl.cert,
    key: ssl.key,
    // TLS 1.2 or higher
    minVersion: 'TLSv1.2',
    // Cipher suites - prioritize secure ciphers
    ciphers: [
      'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256'
    ].join(':'),
    // Enable session resumption
    sessionTimeout: 86400,
  };

  return https.createServer(httpsOptions, app);
};

module.exports = {
  loadSSLCertificates,
  createHTTPSServer
};
