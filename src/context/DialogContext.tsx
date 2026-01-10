import React, {createContext, useContext, useState, useCallback} from 'react';
import {Dialog} from '../components/Dialog';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning' | 'logout';
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions>({
    message: '',
  });

  const showDialog = useCallback((options: DialogOptions) => {
    setDialogOptions(options);
    setVisible(true);
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    if (dialogOptions.onClose) {
      dialogOptions.onClose();
    }
  }, [dialogOptions]);

  const handleConfirm = useCallback(() => {
    if (dialogOptions.onConfirm) {
      dialogOptions.onConfirm();
    }
    setVisible(false);
  }, [dialogOptions]);

  return (
    <DialogContext.Provider value={{showDialog, hideDialog}}>
      {children}
      <Dialog
        visible={visible}
        title={dialogOptions.title}
        message={dialogOptions.message}
        type={dialogOptions.type}
        confirmText={dialogOptions.confirmText}
        showCancel={dialogOptions.showCancel}
        cancelText={dialogOptions.cancelText}
        onClose={hideDialog}
        onConfirm={handleConfirm}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// Global dialog reference for use outside of React components (like in API layer)
let globalShowDialog: ((options: DialogOptions) => void) | null = null;

export const setGlobalDialogRef = (showDialog: (options: DialogOptions) => void) => {
  globalShowDialog = showDialog;
};

export const showGlobalDialog = (options: DialogOptions) => {
  if (globalShowDialog) {
    globalShowDialog(options);
  } else {
    console.warn('Dialog not initialized. Make sure DialogProvider is mounted.');
  }
};
