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

/**
 * Validates UPI ID format
 * Rules: username@provider (e.g., 9876543210@paytm, username@upi, etc.)
 * Format: alphanumeric/phone@provider
 * Common providers: paytm, phonepe, googlepay, ybl, okaxis, okhdfcbank, okicici, oksbi, etc.
 */
export const isValidUPI = (upiId: string): boolean => {
  const cleaned = upiId.trim().toLowerCase();
  // UPI format: username@provider
  // Username can be alphanumeric, dots, hyphens, underscores (3-256 chars)
  // Provider is typically 3-50 chars
  const upiRegex = /^[a-z0-9.\-_]{3,256}@[a-z]{3,50}$/;
  return upiRegex.test(cleaned);
};

/**
 * Formats UPI ID (converts to lowercase, removes spaces)
 */
export const formatUPIId = (input: string): string => {
  // Remove spaces and convert to lowercase
  return input.replace(/\s/g, '').toLowerCase();
};

/**
 * Gets comprehensive list of UPI provider handles in India
 * Organized by category: Payment Apps, Public Banks, Private Banks, and Others
 */
export const getCommonUPIProviders = (): string[] => {
  return [
    // Popular Payment Apps
    'paytm', // Paytm
    'phonepe', // PhonePe (alternative)
    'ybl', // PhonePe (Yes Bank)
    'googlepay', // Google Pay (alternative)
    'gpay', // Google Pay
    'okicici', // Google Pay (ICICI)
    'okhdfcbank', // Google Pay (HDFC)
    'okaxis', // Google Pay (Axis)
    'oksbi', // Google Pay (SBI)
    'amazonpay', // Amazon Pay
    'apl', // Amazon Pay
    'freecharge', // Freecharge
    'mobikwik', // MobiKwik
    'airtel', // Airtel Payments Bank
    'airtelpaymentsbank', // Airtel Payments Bank (full)
    'jiomoney', // Jio Money
    'jiopayments', // Jio Payments
    'whatsapp', // WhatsApp Pay

    // State Bank of India & Associates
    'sbi', // State Bank of India
    'oksbi', // SBI (OK prefix)
    'sbiupi', // SBI UPI
    'sbiyono', // SBI YONO
    'yono', // YONO SBI

    // ICICI Bank
    'icici', // ICICI Bank
    'okicici', // ICICI (OK prefix)
    'ibl', // ICICI Bank Ltd
    'pockets', // ICICI Pockets
    'imobile', // ICICI iMobile

    // HDFC Bank
    'hdfcbank', // HDFC Bank
    'okhdfcbank', // HDFC (OK prefix)
    'hdfc', // HDFC
    'payzapp', // HDFC PayZapp

    // Axis Bank
    'axisbank', // Axis Bank
    'okaxis', // Axis (OK prefix)
    'axisb', // Axis Bank (short)
    'axl', // Axis Bank Ltd
    'axis', // Axis

    // Punjab National Bank
    'pnb', // Punjab National Bank
    'okpnb', // PNB (OK prefix)
    'pnbupi', // PNB UPI

    // Bank of Baroda
    'barodampay', // Bank of Baroda M-Pay
    'bob', // Bank of Baroda
    'baroda', // Bank of Baroda
    'okbaroda', // Baroda (OK prefix)

    // Canara Bank
    'cnrb', // Canara Bank
    'canarabank', // Canara Bank
    'okcanara', // Canara (OK prefix)

    // Union Bank of India
    'unionbank', // Union Bank
    'upi', // Union Bank UPI
    'unionbankofindia', // Union Bank of India

    // Bank of India
    'boi', // Bank of India
    'bankofindia', // Bank of India

    // Indian Bank
    'indianbank', // Indian Bank
    'indbank', // Indian Bank

    // Central Bank of India
    'centralbank', // Central Bank
    'cbin', // Central Bank of India

    // Kotak Mahindra Bank
    'kotak', // Kotak Mahindra
    'okkotak', // Kotak (OK prefix)
    'kmbl', // Kotak Mahindra Bank Ltd
    'kmb', // Kotak Mahindra Bank

    // IndusInd Bank
    'indus', // IndusInd Bank
    'indusind', // IndusInd Bank
    'okindusind', // IndusInd (OK prefix)
    'ibl', // IndusInd Bank Ltd

    // Yes Bank
    'yesbank', // Yes Bank
    'yesbankltd', // Yes Bank Ltd
    'ybl', // Yes Bank Ltd

    // IDFC First Bank
    'idfcfirst', // IDFC First Bank
    'idfc', // IDFC Bank
    'idfcbank', // IDFC Bank

    // Federal Bank
    'federal', // Federal Bank
    'federalbank', // Federal Bank
    'fbl', // Federal Bank Ltd

    // RBL Bank
    'rbl', // RBL Bank
    'rblbank', // RBL Bank

    // South Indian Bank
    'sib', // South Indian Bank
    'southindianbank', // South Indian Bank

    // Karnataka Bank
    'kbl', // Karnataka Bank
    'karnatakabank', // Karnataka Bank

    // City Union Bank
    'cub', // City Union Bank
    'cityunionbank', // City Union Bank

    // Bandhan Bank
    'bandhan', // Bandhan Bank
    'bandhanbank', // Bandhan Bank

    // IDBI Bank
    'idbi', // IDBI Bank
    'idbibank', // IDBI Bank

    // UCO Bank
    'uco', // UCO Bank
    'ucobank', // UCO Bank

    // Indian Overseas Bank
    'iob', // Indian Overseas Bank
    'indianoverseasbank', // Indian Overseas Bank

    // Allahabad Bank (now merged with Indian Bank)
    'alla', // Allahabad Bank
    'allahabadbank', // Allahabad Bank

    // Andhra Bank (now merged with Union Bank)
    'andb', // Andhra Bank
    'andhrabank', // Andhra Bank

    // Corporation Bank (now merged with Union Bank)
    'corp', // Corporation Bank
    'corporationbank', // Corporation Bank

    // Oriental Bank of Commerce (now merged with PNB)
    'obc', // Oriental Bank of Commerce

    // United Bank of India (now merged with PNB)
    'ubi', // United Bank of India
    'unitedbank', // United Bank of India

    // Vijaya Bank (now merged with Bank of Baroda)
    'vijaya', // Vijaya Bank
    'vijayabank', // Vijaya Bank

    // Dena Bank (now merged with Bank of Baroda)
    'dena', // Dena Bank
    'denabank', // Dena Bank

    // Syndicate Bank (now merged with Canara Bank)
    'synb', // Syndicate Bank
    'syndicatebank', // Syndicate Bank

    // HSBC
    'hsbc', // HSBC
    'hsbcbank', // HSBC Bank

    // Standard Chartered
    'sc', // Standard Chartered
    'scb', // Standard Chartered Bank
    'standardchartered', // Standard Chartered

    // Citibank
    'citi', // Citibank
    'citibank', // Citibank

    // Deutsche Bank
    'deutsche', // Deutsche Bank
    'deutschebank', // Deutsche Bank

    // DBS Bank
    'dbs', // DBS Bank
    'dbsbank', // DBS Bank

    // Paytm Payments Bank
    'paytmbank', // Paytm Payments Bank
    'ptpb', // Paytm Payments Bank

    // Fino Payments Bank
    'fino', // Fino Payments Bank
    'finobank', // Fino Payments Bank

    // India Post Payments Bank
    'ippb', // India Post Payments Bank
    'indiapost', // India Post

    // AU Small Finance Bank
    'aubank', // AU Small Finance Bank
    'ausf', // AU Small Finance

    // Equitas Small Finance Bank
    'equitas', // Equitas Small Finance Bank
    'esfb', // Equitas Small Finance Bank

    // Ujjivan Small Finance Bank
    'ujjivan', // Ujjivan Small Finance Bank
    'usfb', // Ujjivan Small Finance Bank

    // ESAF Small Finance Bank
    'esaf', // ESAF Small Finance Bank
    'esafbank', // ESAF Small Finance Bank

    // Jana Small Finance Bank
    'jana', // Jana Small Finance Bank
    'janabank', // Jana Small Finance Bank

    // Suryoday Small Finance Bank
    'suryoday', // Suryoday Small Finance Bank

    // NSDL Payments Bank
    'nsdl', // NSDL Payments Bank

    // Jio Payments Bank
    'jiomoney', // Jio Payments Bank
    'jiopay', // Jio Pay

    // Generic/Common handles
    'upi', // Generic UPI
    'bhim', // BHIM
  ];
};
