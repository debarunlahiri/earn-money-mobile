import {logRequest, logResponse, logError} from '../utils/apiLogger';
import {emitLogoutRequired} from '../utils/authEventEmitter';

const API_BASE_URL = 'https://api.erpvisit.com/api_money.php';

/**
 * Checks if the API response indicates an authentication failure (401)
 * If so, emits a logout event to trigger automatic logout
 */
const checkForAuthError = (data: {
  status?: string;
  status_code?: number;
  message?: string;
}) => {
  if (data.status === 'error' && data.status_code === 401) {
    emitLogoutRequired(data.message || 'Invalid user or token');
    return true;
  }
  return false;
};

export interface VerifyMobileResponse {
  status: string;
  status_code: number;
  message: string;
}

export interface UserData {
  username: string | null;
  mobile: string | null;
  token: number;
  userid: number;
  is_new?: string;
}

export interface VerifyOTPResponse {
  status: string;
  status_code: number;
  message: string;
  is_new?: string;
  userdata?: UserData;
}

/**
 * Sends OTP to the provided mobile number
 */
export const verifyMobile = async (
  mobile: string,
): Promise<VerifyMobileResponse> => {
  const formData = new FormData();
  formData.append('action', 'verify_mobile');
  formData.append('mobile', mobile);

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData, {action: 'verify_mobile1'});

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        action: 'verify_mobile1',
      },
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

/**
 * Verifies OTP for the provided mobile number
 */
export const verifyOTP = async (
  mobile: string,
  otp: string,
): Promise<VerifyOTPResponse> => {
  const formData = new FormData();
  formData.append('action', 'verify_otp');
  formData.append('mobile', mobile);
  formData.append('otp', otp);

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface RegisterUserResponse {
  status: string;
  status_code: number;
  message: string;
  userdata?: {
    userid: number;
    username: string;
    mobile: string;
    token: number;
  };
}

/**
 * Registers user with profile details
 */
export const registerUser = async (params: {
  userid: string;
  ac_no: string;
  ifsc_code: string;
  upi_id: string;
  mobile: string;
  username: string;
  address: string;
  device_token?: string;
}): Promise<RegisterUserResponse> => {
  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('userid', params.userid);
  formData.append('ac_no', params.ac_no);
  formData.append('ifsc_code', params.ifsc_code);
  formData.append('upi_id', params.upi_id);
  formData.append('mobile', params.mobile);
  formData.append('username', params.username);
  formData.append('address', params.address);
  if (params.device_token) {
    formData.append('device_token', params.device_token);
  }

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface ProfileData {
  username: string;
  mobile: string;
  ac_no: string;
  ifsc_code: string;
  address: string;
  userid: number;
  token: number;
  wallet: string;
  created_at: string;
}

export interface ProfileResponse {
  status: string;
  status_code: number;
  message?: string;
  userdata?: ProfileData;
}

/**
 * Fetches user profile data
 */
export const getProfile = async (
  userid: string | number,
  token: string | number,
): Promise<ProfileResponse> => {
  const formData = new FormData();
  formData.append('action', 'profile');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface AddLeadResponse {
  status: string;
  status_code: number;
  message: string;
  lead_id?: number;
}

/**
 * Adds a new lead/enquiry
 */
export const addLead = async (params: {
  userid: string | number;
  token: string | number;
  leadname: string;
  leadmobile: string;
  address: string;
  requirement: string;
}): Promise<AddLeadResponse> => {
  const formData = new FormData();
  formData.append('action', 'add_lead');
  formData.append('userid', params.userid.toString());
  formData.append('token', params.token.toString());
  formData.append('leadname', params.leadname);
  formData.append('leadmobile', params.leadmobile);
  formData.append('address', params.address);
  formData.append('requirement', params.requirement);

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface Lead {
  id: number;
  status: string;
  name: string;
  mobile: string;
  address: string;
  requirement: string;
  created_at: string;
}

export interface ViewLeadsResponse {
  status: string;
  status_code: number;
  message: string;
  total_leads?: number;
  data?: Lead[];
}

/**
 * Fetches all leads for the user
 */
export const viewLeads = async (
  userid: string | number,
  token: string | number,
): Promise<ViewLeadsResponse> => {
  const formData = new FormData();
  formData.append('action', 'view_lead');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface Notification {
  title: string;
  mess: string;
  date: string;
  time: string;
}

export interface NotificationResponse {
  status: string;
  status_code: number;
  userdata?: Notification[];
}

/**
 * Fetches notifications for the user
 */
export const getNotifications = async (
  userid: string | number,
  token: string | number,
): Promise<NotificationResponse> => {
  const formData = new FormData();
  formData.append('action', 'notification');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface WalletData {
  amount: string;
}

export interface WalletResponse {
  status: string;
  status_code: number;
  userdata?: WalletData;
}

/**
 * Fetches wallet balance for the user
 */
export const getWallet = async (
  userid: string | number,
  token: string | number,
): Promise<WalletResponse> => {
  const formData = new FormData();
  formData.append('action', 'wallet');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface PaymentHistoryItem {
  title: 'credit' | 'debit';
  status: 'success' | 'pending' | 'failed';
  mess: string;
  date: string;
  time: string;
}

export interface PaymentHistoryResponse {
  status: string;
  status_code: number;
  userdata?: PaymentHistoryItem[];
}

/**
 * Fetches payment history for the user
 */
export const getPaymentHistory = async (
  userid: string | number,
  token: string | number,
): Promise<PaymentHistoryResponse> => {
  const formData = new FormData();
  formData.append('action', 'payment_history');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface WithdrawalRequestResponse {
  status: string;
  status_code: number;
  message: string;
}

/**
 * Submits a withdrawal request
 */
export const submitWithdrawalRequest = async (
  userid: string | number,
  token: string | number,
  withdrawal_amt: string | number,
): Promise<WithdrawalRequestResponse> => {
  const formData = new FormData();
  formData.append('action', 'withdrawal_req');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  formData.append('withdrawal_amt', withdrawal_amt.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface UnreadNotificationData {
  unread_count: string;
}

export interface UnreadNotificationResponse {
  status: string;
  status_code: number;
  userdata?: UnreadNotificationData;
}

/**
 * Fetches unread notification count for the user
 */
export const getUnreadNotificationCount = async (
  userid: string | number,
  token: string | number,
): Promise<UnreadNotificationResponse> => {
  const formData = new FormData();
  formData.append('action', 'unread_notification');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface UpdateUnreadNotificationResponse {
  status: string;
  status_code: number;
  userdata?: string;
}

/**
 * Marks all notifications as read for the user
 */
export const updateUnreadNotification = async (
  userid: string | number,
  token: string | number,
): Promise<UpdateUnreadNotificationResponse> => {
  const formData = new FormData();
  formData.append('action', 'update_unread_notification');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface SaveFCMTokenResponse {
  status: string;
  status_code: number;
  message: string;
}

/**
 * Saves FCM token to the backend
 */
export const saveFCMToken = async (
  userid: string | number,
  token: string | number,
  fcm_token: string,
  device_type: string = 'android',
): Promise<SaveFCMTokenResponse> => {
  const formData = new FormData();
  formData.append('action', 'save_fcm_token');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  formData.append('fcm_token', fcm_token);
  formData.append('device_type', device_type);

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

export interface SliderItem {
  img: string;
  title: string;
  sub_title: string;
}

export interface LeadsSummaryItem {
  new?: number;
  processing?: number;
  cancelled?: number;
  converted?: number;
}

export interface ProfileWithLeadsData {
  userid: number;
  username: string;
  mobile: string;
  address: string;
  ac_no: string;
  ifsc_code: string;
}

export interface ProfileWithLeadsResponse {
  status: string;
  status_code: number;
  message?: string;
  userdata?: ProfileWithLeadsData;
  slider?: SliderItem[];
  view_leads?: Lead[];
  leads_summary?: LeadsSummaryItem[];
}

export interface LogoResponse {
  status: string;
  status_code: number;
  logo: string;
}

/**
 * Fetches app logo URL
 */
export const getLogo = async (
  userid: string | number,
  token: string | number,
): Promise<LogoResponse> => {
  const formData = new FormData();
  formData.append('action', 'logo');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

/**
 * Fetches comprehensive profile data including slider, leads, and leads summary
 */
export const getProfileWithLeads = async (
  userid: string | number,
  token: string | number,
): Promise<ProfileWithLeadsResponse> => {
  const formData = new FormData();
  formData.append('action', 'profile');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    logResponse(API_BASE_URL, response.status, data, Date.now() - startTime);
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};
