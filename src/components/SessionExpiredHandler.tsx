import React, {useEffect, useState} from 'react';
import {Dialog} from './Dialog';
import {subscribeToLogoutRequired} from '../utils/authEventEmitter';

/**
 * Component that listens for session expiration events and shows a custom dialog
 * This component should be placed inside DialogProvider but works independently
 */
export const SessionExpiredHandler: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToLogoutRequired((data) => {
      setMessage(data.message || 'Your session has expired. Please login again.');
      setVisible(true);
    });

    return unsubscribe;
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Dialog
      visible={visible}
      title="Session Expired"
      message={message}
      type="error"
      confirmText="OK"
      onClose={handleClose}
    />
  );
};
