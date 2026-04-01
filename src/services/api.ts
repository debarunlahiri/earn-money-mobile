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

export interface PropertyTypesResponse {
  status: string;
  status_code: number;
  message: string[];
}

export interface PropertySearchForResponse {
  status: string;
  status_code: number;
  message: string[];
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
  upi_id?: string;
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
  expo_token?: string,
): Promise<ProfileResponse> => {
  const formData = new FormData();
  formData.append('action', 'profile');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  if (expo_token) {
    formData.append('expo_token', expo_token);
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
  property_for?: string;
  property_type?: string;
  budget?: string | number;
  use_my_name?: string;
  reference_name?: string;
}): Promise<AddLeadResponse> => {
  const formData = new FormData();
  formData.append('action', 'add_lead');
  formData.append('userid', params.userid.toString());
  formData.append('token', params.token.toString());
  formData.append('leadname', params.leadname);
  formData.append('leadmobile', params.leadmobile);
  formData.append('address', params.address);
  formData.append('requirement', params.requirement);
  if (params.property_for) {
    formData.append('property_for', params.property_for);
  }
  if (params.property_type) {
    formData.append('property_type', params.property_type);
  }
  if (params.budget !== undefined && params.budget !== null) {
    formData.append('budget', params.budget.toString());
  }
  if (params.use_my_name) {
    formData.append('use_my_name', params.use_my_name);
  }
  if (params.reference_name) {
    formData.append('reference_name', params.reference_name);
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

export interface AllUsersResponse {
  status: string;
  status_code: number;
  message: Record<string, string> | string;
}

export interface AllStatusResponse {
  status: string;
  status_code: number;
  message: string[] | string;
}

export interface ForwardLeadResponse {
  status: string;
  status_code: number;
  message: string;
}

export interface ForwardLeadListItem {
  status: string;
  requirement: string;
  date_time: string;
  forward_to: string;
  forward_by: string;
  remark: string;
  lead_id: string;
}

export interface ViewForwardLeadsResponse {
  status: string;
  status_code: number;
  message: string;
  total_leads?: number;
  data?: Record<string, ForwardLeadListItem> | ForwardLeadListItem[];
}

/**
 * Fetches all users for forward lead dropdown
 */
export const getAllUsers = async (
  userid: string | number,
  token: string | number,
): Promise<AllUsersResponse> => {
  const formData = new FormData();
  formData.append('action', 'all_user');
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
 * Fetches all statuses for forward lead dropdown
 */
export const getAllStatuses = async (
  userid: string | number,
  token: string | number,
): Promise<AllStatusResponse> => {
  const formData = new FormData();
  formData.append('action', 'all_status');
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
 * Submits lead forwarding details
 */
export const submitForwardLead = async (params: {
  lead_id: string | number;
  forward_to: string | number;
  status: string;
  remark: string;
  user_id: string | number;
  userid: string | number;
  token: string | number;
}): Promise<ForwardLeadResponse> => {
  const formData = new FormData();
  formData.append('action', 'add_forward_lead');
  formData.append('lead_id', params.lead_id.toString());
  formData.append('forward_to', params.forward_to.toString());
  formData.append('status', params.status);
  formData.append('remark', params.remark);
  formData.append('user_id', params.user_id.toString());
  formData.append('userid', params.userid.toString());
  formData.append('token', params.token.toString());

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
 * Fetches forwarded leads list
 */
export const viewForwardLeads = async (
  userid: string | number,
  token: string | number,
): Promise<ViewForwardLeadsResponse> => {
  const formData = new FormData();
  formData.append('action', 'view_forward_leads');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    let data: ViewForwardLeadsResponse;

    if (!responseText || responseText.trim().length === 0) {
      data = {
        status: 'error',
        status_code: response.status || 500,
        message: 'Empty response from server',
      };
    } else {
      try {
        data = JSON.parse(responseText) as ViewForwardLeadsResponse;
      } catch (parseError) {
        logError(
          API_BASE_URL,
          new Error(
            `Invalid JSON response for view_forward_leads: ${responseText.slice(0, 300)}`,
          ),
          Date.now() - startTime,
        );
        data = {
          status: 'error',
          status_code: response.status || 500,
          message: 'Invalid response format from server',
        };
      }
    }

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

export interface SaveExpoTokenResponse {
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

/**
 * Saves Expo push token to the backend
 */
export const saveExpoToken = async (
  userid: string | number,
  token: string | number,
  expo_token: string,
): Promise<SaveExpoTokenResponse> => {
  console.log('[ExpoToken][API] saveExpoToken called', {
    action: 'expo_token',
    userid: userid.toString(),
    token: token.toString(),
    expo_token,
  });
  const formData = new FormData();
  formData.append('action', 'expo_token');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  formData.append('expo_token', expo_token);

  const startTime = Date.now();
  logRequest(API_BASE_URL, 'POST', formData);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('[ExpoToken][API] saveExpoToken response', data);
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
  expo_token?: string,
): Promise<ProfileWithLeadsResponse> => {
  const formData = new FormData();
  formData.append('action', 'profile');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  if (expo_token) {
    formData.append('expo_token', expo_token);
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
    checkForAuthError(data);
    return data;
  } catch (error) {
    logError(API_BASE_URL, error, Date.now() - startTime);
    throw error;
  }
};

/**
 * Fetches property types from API
 */
export const getPropertyTypes = async (): Promise<PropertyTypesResponse> => {
  const formData = new FormData();
  formData.append('action', 'property_type');

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

/**
 * Fetches property search for options from API
 */
export const getPropertySearchFor = async (propertyType?: string): Promise<PropertySearchForResponse> => {
  const formData = new FormData();
  formData.append('action', 'property_for');
  if (propertyType) {
    formData.append('property_type', propertyType);
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

/**
 * Updates user profile
 */
export interface UpdateProfileResponse {
  status: string;
  status_code: number;
  message?: string;
}

export const updateProfile = async (
  userid: string | number,
  token: string | number,
  username: string,
  ifsc_code: string,
  upi_id: string,
  ac_no: string,
  address: string,
): Promise<UpdateProfileResponse> => {
  const formData = new FormData();
  formData.append('action', 'update_profile');
  formData.append('userid', userid.toString());
  formData.append('token', token.toString());
  formData.append('ifsc_code', ifsc_code);
  formData.append('username', username);
  formData.append('upi_id', upi_id);
  formData.append('ac_no', ac_no);
  formData.append('address', address);

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
