import {NavigationProp, NavigatorScreenParams} from '@react-navigation/native';

export type HomeTabParamList = {
  Dashboard: undefined;
  WalletTab: undefined;
  NotificationTab: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    phoneNumber: string;
    isRegister?: boolean;
  };
  RegisterDetails: {
    phoneNumber: string;
  };
  Home: NavigatorScreenParams<HomeTabParamList> | undefined;
  EnquiryDetails: {
    enquiry: any;
  };
  StatusDetails: {
    status: any;
  };
  SellBuySelection: undefined;
  PropertyForm: {
    enquiryType: 'sell' | 'buy';
  };
  AddNewEnquiry:
    | {
        lead?: any;
        isEditMode?: boolean;
      }
    | undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Wallet: undefined;
  WithdrawMoney: undefined;
  TransactionHistory: undefined;
  MyLeads: undefined;
  AllLeads: undefined;
  LeadDetails: {
    lead?: any;
    leadId?: string | number;
    canEdit?: boolean;
  } | undefined;
  ForwardLead: undefined;
  ForwardLeadDetails: undefined;
  SupportChat: undefined;
  About: undefined;
  Notifications: undefined;
  AdminChatInbox: undefined;
  AdminChatDetail: undefined;
};

export type NavigationProps = NavigationProp<RootStackParamList>;
