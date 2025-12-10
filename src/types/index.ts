export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  profileImage?: string;
}

export interface Enquiry {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  phoneNumber: string;
  propertyType?: string;
  propertyName?: string;
  propertyPrice?: string;
  propertyLocation?: string;
  propertyArea?: string;
  propertyStatus?: string;
  propertyAmenities?: string[];
  propertyFeatures?: string[];
  propertyDocuments?: string[];
  enquiryType?: 'sell' | 'buy';
}

export interface Status {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  phoneNumber: string;
  enquiryFor: string;
  email?: string;
  propertySearchFor: string;
  propertySearchingIn: string;
  minBudget: number;
  maxBudget: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
}

export interface PropertyFormData {
  propertyType: string;
  propertyName: string;
  propertyDescription: string;
  propertyImage: string | null;
  propertyPrice: string;
  propertyLocation: string;
  propertyArea: string;
  propertyStatus: string;
  propertyAmenities: string[];
  propertyFeatures: string[];
  propertyDocuments: string[];
  enquiryType: 'sell' | 'buy';
}
