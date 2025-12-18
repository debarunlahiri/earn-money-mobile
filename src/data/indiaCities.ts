// India Cities Data - Major cities mapped to states

export interface City {
  id: string;
  name: string;
  stateId: string;
}

export const INDIA_CITIES: City[] = [
  // Andhra Pradesh
  {id: 'VIJ', name: 'Vijayawada', stateId: 'AP'},
  {id: 'VIS', name: 'Visakhapatnam', stateId: 'AP'},
  {id: 'GUN', name: 'Guntur', stateId: 'AP'},
  {id: 'NEL', name: 'Nellore', stateId: 'AP'},
  {id: 'KUR', name: 'Kurnool', stateId: 'AP'},
  {id: 'RAJ', name: 'Rajahmundry', stateId: 'AP'},
  {id: 'TIR', name: 'Tirupati', stateId: 'AP'},
  {id: 'KAD', name: 'Kadapa', stateId: 'AP'},
  {id: 'ANA', name: 'Anantapur', stateId: 'AP'},

  // Arunachal Pradesh
  {id: 'ITA', name: 'Itanagar', stateId: 'AR'},
  {id: 'NHR', name: 'Naharlagun', stateId: 'AR'},
  {id: 'PAS', name: 'Pasighat', stateId: 'AR'},
  {id: 'TAW', name: 'Tawang', stateId: 'AR'},

  // Assam
  {id: 'GUW', name: 'Guwahati', stateId: 'AS'},
  {id: 'SIL', name: 'Silchar', stateId: 'AS'},
  {id: 'DIB', name: 'Dibrugarh', stateId: 'AS'},
  {id: 'JOR', name: 'Jorhat', stateId: 'AS'},
  {id: 'NAG', name: 'Nagaon', stateId: 'AS'},
  {id: 'TIN', name: 'Tinsukia', stateId: 'AS'},
  {id: 'TEZ', name: 'Tezpur', stateId: 'AS'},

  // Bihar
  {id: 'PAT', name: 'Patna', stateId: 'BR'},
  {id: 'GAY', name: 'Gaya', stateId: 'BR'},
  {id: 'BHA', name: 'Bhagalpur', stateId: 'BR'},
  {id: 'MUZ', name: 'Muzaffarpur', stateId: 'BR'},
  {id: 'PUR', name: 'Purnia', stateId: 'BR'},
  {id: 'DAR', name: 'Darbhanga', stateId: 'BR'},
  {id: 'BIH', name: 'Bihar Sharif', stateId: 'BR'},
  {id: 'ARE', name: 'Arrah', stateId: 'BR'},
  {id: 'BEG', name: 'Begusarai', stateId: 'BR'},

  // Chhattisgarh
  {id: 'RAI', name: 'Raipur', stateId: 'CG'},
  {id: 'BIL', name: 'Bilaspur', stateId: 'CG'},
  {id: 'DUR', name: 'Durg', stateId: 'CG'},
  {id: 'BHI', name: 'Bhilai', stateId: 'CG'},
  {id: 'KOR', name: 'Korba', stateId: 'CG'},
  {id: 'RAJ', name: 'Rajnandgaon', stateId: 'CG'},
  {id: 'JAG', name: 'Jagdalpur', stateId: 'CG'},

  // Goa
  {id: 'PAN', name: 'Panaji', stateId: 'GA'},
  {id: 'MAR', name: 'Margao', stateId: 'GA'},
  {id: 'VAS', name: 'Vasco da Gama', stateId: 'GA'},
  {id: 'MAP', name: 'Mapusa', stateId: 'GA'},
  {id: 'PON', name: 'Ponda', stateId: 'GA'},

  // Gujarat
  {id: 'AHM', name: 'Ahmedabad', stateId: 'GJ'},
  {id: 'SUR', name: 'Surat', stateId: 'GJ'},
  {id: 'VAD', name: 'Vadodara', stateId: 'GJ'},
  {id: 'RAJ', name: 'Rajkot', stateId: 'GJ'},
  {id: 'BHV', name: 'Bhavnagar', stateId: 'GJ'},
  {id: 'JAM', name: 'Jamnagar', stateId: 'GJ'},
  {id: 'GAN', name: 'Gandhinagar', stateId: 'GJ'},
  {id: 'JUN', name: 'Junagadh', stateId: 'GJ'},
  {id: 'ANA', name: 'Anand', stateId: 'GJ'},
  {id: 'NAV', name: 'Navsari', stateId: 'GJ'},

  // Haryana
  {id: 'GUR', name: 'Gurugram', stateId: 'HR'},
  {id: 'FAR', name: 'Faridabad', stateId: 'HR'},
  {id: 'PAN', name: 'Panipat', stateId: 'HR'},
  {id: 'AMB', name: 'Ambala', stateId: 'HR'},
  {id: 'KAR', name: 'Karnal', stateId: 'HR'},
  {id: 'ROH', name: 'Rohtak', stateId: 'HR'},
  {id: 'HIS', name: 'Hisar', stateId: 'HR'},
  {id: 'SON', name: 'Sonipat', stateId: 'HR'},
  {id: 'YAM', name: 'Yamunanagar', stateId: 'HR'},
  {id: 'REW', name: 'Rewari', stateId: 'HR'},

  // Himachal Pradesh
  {id: 'SHI', name: 'Shimla', stateId: 'HP'},
  {id: 'DHA', name: 'Dharamshala', stateId: 'HP'},
  {id: 'MAN', name: 'Manali', stateId: 'HP'},
  {id: 'SOL', name: 'Solan', stateId: 'HP'},
  {id: 'KUL', name: 'Kullu', stateId: 'HP'},
  {id: 'MAN', name: 'Mandi', stateId: 'HP'},
  {id: 'BAD', name: 'Baddi', stateId: 'HP'},

  // Jharkhand
  {id: 'RAN', name: 'Ranchi', stateId: 'JH'},
  {id: 'JAM', name: 'Jamshedpur', stateId: 'JH'},
  {id: 'DHA', name: 'Dhanbad', stateId: 'JH'},
  {id: 'BOK', name: 'Bokaro', stateId: 'JH'},
  {id: 'DEO', name: 'Deoghar', stateId: 'JH'},
  {id: 'HAZ', name: 'Hazaribagh', stateId: 'JH'},
  {id: 'GIR', name: 'Giridih', stateId: 'JH'},

  // Karnataka
  {id: 'BLR', name: 'Bengaluru', stateId: 'KA'},
  {id: 'MYS', name: 'Mysuru', stateId: 'KA'},
  {id: 'HUB', name: 'Hubli', stateId: 'KA'},
  {id: 'MAN', name: 'Mangaluru', stateId: 'KA'},
  {id: 'BEL', name: 'Belagavi', stateId: 'KA'},
  {id: 'DAV', name: 'Davangere', stateId: 'KA'},
  {id: 'BAL', name: 'Ballari', stateId: 'KA'},
  {id: 'TUM', name: 'Tumakuru', stateId: 'KA'},
  {id: 'UDU', name: 'Udupi', stateId: 'KA'},
  {id: 'SHV', name: 'Shivamogga', stateId: 'KA'},

  // Kerala
  {id: 'TVM', name: 'Thiruvananthapuram', stateId: 'KL'},
  {id: 'KOC', name: 'Kochi', stateId: 'KL'},
  {id: 'KOZ', name: 'Kozhikode', stateId: 'KL'},
  {id: 'THR', name: 'Thrissur', stateId: 'KL'},
  {id: 'KOL', name: 'Kollam', stateId: 'KL'},
  {id: 'ALA', name: 'Alappuzha', stateId: 'KL'},
  {id: 'PAL', name: 'Palakkad', stateId: 'KL'},
  {id: 'KAN', name: 'Kannur', stateId: 'KL'},
  {id: 'KOT', name: 'Kottayam', stateId: 'KL'},

  // Madhya Pradesh
  {id: 'BHO', name: 'Bhopal', stateId: 'MP'},
  {id: 'IND', name: 'Indore', stateId: 'MP'},
  {id: 'JAB', name: 'Jabalpur', stateId: 'MP'},
  {id: 'GWL', name: 'Gwalior', stateId: 'MP'},
  {id: 'UJJ', name: 'Ujjain', stateId: 'MP'},
  {id: 'SAG', name: 'Sagar', stateId: 'MP'},
  {id: 'DEW', name: 'Dewas', stateId: 'MP'},
  {id: 'SAT', name: 'Satna', stateId: 'MP'},
  {id: 'REW', name: 'Rewa', stateId: 'MP'},
  {id: 'RAT', name: 'Ratlam', stateId: 'MP'},

  // Maharashtra
  {id: 'MUM', name: 'Mumbai', stateId: 'MH'},
  {id: 'PUN', name: 'Pune', stateId: 'MH'},
  {id: 'NAG', name: 'Nagpur', stateId: 'MH'},
  {id: 'THA', name: 'Thane', stateId: 'MH'},
  {id: 'NMU', name: 'Navi Mumbai', stateId: 'MH'},
  {id: 'NAS', name: 'Nashik', stateId: 'MH'},
  {id: 'AUR', name: 'Aurangabad', stateId: 'MH'},
  {id: 'SOL', name: 'Solapur', stateId: 'MH'},
  {id: 'AMR', name: 'Amravati', stateId: 'MH'},
  {id: 'KOL', name: 'Kolhapur', stateId: 'MH'},
  {id: 'VAS', name: 'Vasai-Virar', stateId: 'MH'},
  {id: 'MIR', name: 'Mira-Bhayandar', stateId: 'MH'},

  // Manipur
  {id: 'IMP', name: 'Imphal', stateId: 'MN'},
  {id: 'THO', name: 'Thoubal', stateId: 'MN'},
  {id: 'BIS', name: 'Bishnupur', stateId: 'MN'},
  {id: 'CHU', name: 'Churachandpur', stateId: 'MN'},

  // Meghalaya
  {id: 'SHI', name: 'Shillong', stateId: 'ML'},
  {id: 'TUR', name: 'Tura', stateId: 'ML'},
  {id: 'JOW', name: 'Jowai', stateId: 'ML'},
  {id: 'NON', name: 'Nongpoh', stateId: 'ML'},

  // Mizoram
  {id: 'AIZ', name: 'Aizawl', stateId: 'MZ'},
  {id: 'LUN', name: 'Lunglei', stateId: 'MZ'},
  {id: 'SAI', name: 'Saiha', stateId: 'MZ'},
  {id: 'CHA', name: 'Champhai', stateId: 'MZ'},

  // Nagaland
  {id: 'KOH', name: 'Kohima', stateId: 'NL'},
  {id: 'DIM', name: 'Dimapur', stateId: 'NL'},
  {id: 'MOK', name: 'Mokokchung', stateId: 'NL'},
  {id: 'TUE', name: 'Tuensang', stateId: 'NL'},

  // Odisha
  {id: 'BHU', name: 'Bhubaneswar', stateId: 'OD'},
  {id: 'CTK', name: 'Cuttack', stateId: 'OD'},
  {id: 'ROU', name: 'Rourkela', stateId: 'OD'},
  {id: 'BER', name: 'Berhampur', stateId: 'OD'},
  {id: 'SAM', name: 'Sambalpur', stateId: 'OD'},
  {id: 'PUR', name: 'Puri', stateId: 'OD'},
  {id: 'BAL', name: 'Balasore', stateId: 'OD'},
  {id: 'BHA', name: 'Bhadrak', stateId: 'OD'},

  // Punjab
  {id: 'LUD', name: 'Ludhiana', stateId: 'PB'},
  {id: 'AMR', name: 'Amritsar', stateId: 'PB'},
  {id: 'JAL', name: 'Jalandhar', stateId: 'PB'},
  {id: 'PAT', name: 'Patiala', stateId: 'PB'},
  {id: 'BAT', name: 'Bathinda', stateId: 'PB'},
  {id: 'MOH', name: 'Mohali', stateId: 'PB'},
  {id: 'HOS', name: 'Hoshiarpur', stateId: 'PB'},
  {id: 'PAK', name: 'Pathankot', stateId: 'PB'},
  {id: 'PHG', name: 'Phagwara', stateId: 'PB'},

  // Rajasthan
  {id: 'JAI', name: 'Jaipur', stateId: 'RJ'},
  {id: 'JOD', name: 'Jodhpur', stateId: 'RJ'},
  {id: 'KOT', name: 'Kota', stateId: 'RJ'},
  {id: 'BIK', name: 'Bikaner', stateId: 'RJ'},
  {id: 'AJM', name: 'Ajmer', stateId: 'RJ'},
  {id: 'UDA', name: 'Udaipur', stateId: 'RJ'},
  {id: 'BHA', name: 'Bhilwara', stateId: 'RJ'},
  {id: 'ALW', name: 'Alwar', stateId: 'RJ'},
  {id: 'GAG', name: 'Ganganagar', stateId: 'RJ'},
  {id: 'SIK', name: 'Sikar', stateId: 'RJ'},

  // Sikkim
  {id: 'GAN', name: 'Gangtok', stateId: 'SK'},
  {id: 'NAM', name: 'Namchi', stateId: 'SK'},
  {id: 'GYA', name: 'Gyalshing', stateId: 'SK'},
  {id: 'MAN', name: 'Mangan', stateId: 'SK'},

  // Tamil Nadu
  {id: 'CHE', name: 'Chennai', stateId: 'TN'},
  {id: 'COI', name: 'Coimbatore', stateId: 'TN'},
  {id: 'MAD', name: 'Madurai', stateId: 'TN'},
  {id: 'TRI', name: 'Tiruchirappalli', stateId: 'TN'},
  {id: 'SAL', name: 'Salem', stateId: 'TN'},
  {id: 'TIR', name: 'Tirunelveli', stateId: 'TN'},
  {id: 'ERO', name: 'Erode', stateId: 'TN'},
  {id: 'VEL', name: 'Vellore', stateId: 'TN'},
  {id: 'TOO', name: 'Thoothukudi', stateId: 'TN'},
  {id: 'TAN', name: 'Thanjavur', stateId: 'TN'},
  {id: 'TIU', name: 'Tiruppur', stateId: 'TN'},

  // Telangana
  {id: 'HYD', name: 'Hyderabad', stateId: 'TS'},
  {id: 'WAR', name: 'Warangal', stateId: 'TS'},
  {id: 'NIZ', name: 'Nizamabad', stateId: 'TS'},
  {id: 'KAR', name: 'Karimnagar', stateId: 'TS'},
  {id: 'KHA', name: 'Khammam', stateId: 'TS'},
  {id: 'MAH', name: 'Mahbubnagar', stateId: 'TS'},
  {id: 'RAN', name: 'Rangareddy', stateId: 'TS'},
  {id: 'SAN', name: 'Sangareddy', stateId: 'TS'},
  {id: 'SEC', name: 'Secunderabad', stateId: 'TS'},

  // Tripura
  {id: 'AGA', name: 'Agartala', stateId: 'TR'},
  {id: 'UDA', name: 'Udaipur', stateId: 'TR'},
  {id: 'DHA', name: 'Dharmanagar', stateId: 'TR'},
  {id: 'KAI', name: 'Kailashahar', stateId: 'TR'},

  // Uttarakhand
  {id: 'DEH', name: 'Dehradun', stateId: 'UK'},
  {id: 'HAR', name: 'Haridwar', stateId: 'UK'},
  {id: 'RIS', name: 'Rishikesh', stateId: 'UK'},
  {id: 'ROO', name: 'Roorkee', stateId: 'UK'},
  {id: 'HAL', name: 'Haldwani', stateId: 'UK'},
  {id: 'NAI', name: 'Nainital', stateId: 'UK'},
  {id: 'MUS', name: 'Mussoorie', stateId: 'UK'},
  {id: 'KAS', name: 'Kashipur', stateId: 'UK'},

  // Uttar Pradesh
  {id: 'LKO', name: 'Lucknow', stateId: 'UP'},
  {id: 'KAN', name: 'Kanpur', stateId: 'UP'},
  {id: 'GHZ', name: 'Ghaziabad', stateId: 'UP'},
  {id: 'AGR', name: 'Agra', stateId: 'UP'},
  {id: 'NOI', name: 'Noida', stateId: 'UP'},
  {id: 'VAR', name: 'Varanasi', stateId: 'UP'},
  {id: 'PRY', name: 'Prayagraj', stateId: 'UP'},
  {id: 'MEE', name: 'Meerut', stateId: 'UP'},
  {id: 'BAR', name: 'Bareilly', stateId: 'UP'},
  {id: 'ALI', name: 'Aligarh', stateId: 'UP'},
  {id: 'MOR', name: 'Moradabad', stateId: 'UP'},
  {id: 'SAH', name: 'Saharanpur', stateId: 'UP'},
  {id: 'GBN', name: 'Greater Noida', stateId: 'UP'},
  {id: 'GOR', name: 'Gorakhpur', stateId: 'UP'},
  {id: 'MAT', name: 'Mathura', stateId: 'UP'},

  // West Bengal
  {id: 'KOL', name: 'Kolkata', stateId: 'WB'},
  {id: 'HOW', name: 'Howrah', stateId: 'WB'},
  {id: 'DUR', name: 'Durgapur', stateId: 'WB'},
  {id: 'ASA', name: 'Asansol', stateId: 'WB'},
  {id: 'SIL', name: 'Siliguri', stateId: 'WB'},
  {id: 'BAR', name: 'Bardhaman', stateId: 'WB'},
  {id: 'MAL', name: 'Malda', stateId: 'WB'},
  {id: 'KHR', name: 'Kharagpur', stateId: 'WB'},
  {id: 'HAL', name: 'Haldia', stateId: 'WB'},
  {id: 'DAR', name: 'Darjeeling', stateId: 'WB'},

  // Andaman and Nicobar Islands
  {id: 'PBL', name: 'Port Blair', stateId: 'AN'},
  {id: 'HAV', name: 'Havelock Island', stateId: 'AN'},
  {id: 'DIG', name: 'Diglipur', stateId: 'AN'},

  // Chandigarh
  {id: 'CHD', name: 'Chandigarh', stateId: 'CH'},

  // Dadra and Nagar Haveli and Daman and Diu
  {id: 'SIL', name: 'Silvassa', stateId: 'DN'},
  {id: 'DAM', name: 'Daman', stateId: 'DN'},
  {id: 'DIU', name: 'Diu', stateId: 'DN'},

  // Delhi
  {id: 'NDL', name: 'New Delhi', stateId: 'DL'},
  {id: 'CDL', name: 'Central Delhi', stateId: 'DL'},
  {id: 'SDL', name: 'South Delhi', stateId: 'DL'},
  {id: 'EDL', name: 'East Delhi', stateId: 'DL'},
  {id: 'WDL', name: 'West Delhi', stateId: 'DL'},
  {id: 'NED', name: 'North East Delhi', stateId: 'DL'},
  {id: 'NWD', name: 'North West Delhi', stateId: 'DL'},
  {id: 'SWD', name: 'South West Delhi', stateId: 'DL'},
  {id: 'SED', name: 'South East Delhi', stateId: 'DL'},
  {id: 'SHA', name: 'Shahdara', stateId: 'DL'},
  {id: 'DWK', name: 'Dwarka', stateId: 'DL'},

  // Jammu and Kashmir
  {id: 'SRI', name: 'Srinagar', stateId: 'JK'},
  {id: 'JAM', name: 'Jammu', stateId: 'JK'},
  {id: 'ANA', name: 'Anantnag', stateId: 'JK'},
  {id: 'BAR', name: 'Baramulla', stateId: 'JK'},
  {id: 'UDP', name: 'Udhampur', stateId: 'JK'},
  {id: 'KAT', name: 'Kathua', stateId: 'JK'},
  {id: 'SOP', name: 'Sopore', stateId: 'JK'},

  // Ladakh
  {id: 'LEH', name: 'Leh', stateId: 'LA'},
  {id: 'KAR', name: 'Kargil', stateId: 'LA'},

  // Lakshadweep
  {id: 'KAV', name: 'Kavaratti', stateId: 'LD'},
  {id: 'AGT', name: 'Agatti', stateId: 'LD'},
  {id: 'MIN', name: 'Minicoy', stateId: 'LD'},

  // Puducherry
  {id: 'PUD', name: 'Puducherry', stateId: 'PY'},
  {id: 'KAR', name: 'Karaikal', stateId: 'PY'},
  {id: 'MAH', name: 'Mahe', stateId: 'PY'},
  {id: 'YAN', name: 'Yanam', stateId: 'PY'},
];

// Helper function to get cities by state
export const getCitiesByState = (stateId: string): City[] => {
  return INDIA_CITIES.filter(city => city.stateId === stateId);
};
