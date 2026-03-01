/**
 * Generate PKCE codes for OAuth
 * @returns {Promise<{code_verifier: string, code_challenge: string}>}
 */
export async function generatePKCECodes() {
  const code_verifier = generateRandomString(128);
  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  
  const hash = await crypto.subtle.digest('SHA-256', data);
  const code_challenge = base64URLEncode(hash);
  
  return { code_verifier, code_challenge };
}

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  return result;
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}