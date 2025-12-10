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
