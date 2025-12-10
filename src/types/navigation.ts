import {NavigationProp} from '@react-navigation/native';

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
  Home: undefined;
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
  AddNewEnquiry: undefined;
};

export type NavigationProps = NavigationProp<RootStackParamList>;
