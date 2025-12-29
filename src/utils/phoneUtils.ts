import {Linking} from 'react-native';

export const makePhoneCall = (phoneNumber: string) => {
  const url = `tel:${phoneNumber}`;
  Linking.openURL(url).catch(err => {
    console.error('Error making phone call:', err);
  });
};

export const openWhatsApp = (phoneNumber: string, message?: string) => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const url = `whatsapp://send?phone=${cleanNumber}${
    message ? `&text=${encodeURIComponent(message)}` : ''
  }`;

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const webUrl = `https://wa.me/${cleanNumber}${
          message ? `?text=${encodeURIComponent(message)}` : ''
        }`;
        return Linking.openURL(webUrl);
      }
    })
    .catch(err => {
      console.error('Error opening WhatsApp:', err);
    });
};

/**
 * Formats and validates Indian phone numbers
 * Handles various formats:
 * - 10-digit numbers
 * - Numbers starting with 0
 * - Numbers with +91 prefix
 * - Numbers with spaces/dashes
 */
export const formatIndianPhoneNumber = (input: string): string => {
  // Remove all non-digit characters except + at the start
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // Remove +91 if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  
  // Remove leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Limit to 10 digits
  cleaned = cleaned.substring(0, 10);
  
  return cleaned;
};

/**
 * Validates if the phone number is a valid Indian 10-digit number
 */
export const isValidIndianPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = formatIndianPhoneNumber(phoneNumber);
  // Indian mobile numbers start with 6, 7, 8, or 9
  return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Formats phone number for display with +91 prefix
 */
export const formatPhoneNumberForDisplay = (phoneNumber: string): string => {
  const cleaned = formatIndianPhoneNumber(phoneNumber);
  if (cleaned.length === 0) return '';
  
  // Format as +91 XXXXX XXXXX
  if (cleaned.length <= 5) {
    return `+91 ${cleaned}`;
  } else {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
};

/**
 * Gets the full phone number with +91 prefix for API calls
 */
export const getFullPhoneNumber = (phoneNumber: string): string => {
  const cleaned = formatIndianPhoneNumber(phoneNumber);
  return cleaned.length === 10 ? `+91${cleaned}` : cleaned;
};

/**
 * Validates Indian username
 * Rules: 3-30 characters, alphanumeric with underscore/hyphen, no spaces
 */
export const isValidIndianUsername = (username: string): boolean => {
  const trimmed = username.trim();
  // 3-30 characters, alphanumeric with underscore and hyphen, no spaces
  return /^[a-zA-Z0-9_-]{3,30}$/.test(trimmed);
};

/**
 * Formats username (removes spaces, converts to lowercase)
 */
export const formatUsername = (input: string): string => {
  // Remove spaces and convert to lowercase
  return input.replace(/\s/g, '').toLowerCase();
};

/**
 * Validates Indian bank account number
 * Rules: 9-18 digits (most banks use 9, 11, 12, 15, or 18 digits)
 */
export const isValidIndianAccountNumber = (accountNumber: string): boolean => {
  const cleaned = accountNumber.replace(/\s/g, '');
  // Indian bank account numbers are typically 9-18 digits
  return /^\d{9,18}$/.test(cleaned);
};

/**
 * Formats account number (removes spaces)
 */
export const formatAccountNumber = (input: string): string => {
  // Remove all non-digit characters
  return input.replace(/\D/g, '');
};

/**
 * Validates Indian IFSC Code
 * Rules: Exactly 11 characters - 4 letters (bank code) + 0 (zero) + 6 alphanumeric (branch code)
 * Format: XXXX0XXXXX (e.g., SBIN0001234)
 */
export const isValidIndianIFSC = (ifscCode: string): boolean => {
  const cleaned = ifscCode.trim().toUpperCase();
  // IFSC format: 4 letters + 0 + 6 alphanumeric
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned);
};

/**
 * Formats IFSC code (converts to uppercase, removes spaces)
 */
export const formatIFSCCode = (input: string): string => {
  // Remove spaces and convert to uppercase
  return input.replace(/\s/g, '').toUpperCase();
};
