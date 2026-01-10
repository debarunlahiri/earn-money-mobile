import {initializeApp} from 'firebase/app';
import {getDatabase} from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCRULDhOXCHn19L9cb-6rbtyQwj9JAc89c',
  authDomain: 'onlinecall-c4e67.firebaseapp.com',
  databaseURL:
    'https://onlinecall-c4e67-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'onlinecall-c4e67',
  storageBucket: 'onlinecall-c4e67.firebasestorage.app',
  messagingSenderId: '940757586294',
  appId: '1:940757586294:web:f875d66dc510e0fa85aa57',
  measurementId: 'G-7HE7BLXC8D',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Admin phone numbers authorized to reply to user messages
export const ADMIN_PHONE_NUMBERS = ['+919389735755', '+918929607491'];
