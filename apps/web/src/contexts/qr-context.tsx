import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface QrContextType {
  qrOpen: boolean;
  openQr: () => void;
  closeQr: () => void;
}

const QrContext = createContext<QrContextType | undefined>(undefined);

export const QrProvider = ({ children }: { children: ReactNode }) => {
  const [qrOpen, setQrOpen] = useState(false);

  const openQr = () => setQrOpen(true);
  const closeQr = () => setQrOpen(false);

  return (
    <QrContext.Provider value={{ qrOpen, openQr, closeQr }}>
      {children}
    </QrContext.Provider>
  );
};

export const useQrModal = () => {
  const context = useContext(QrContext);
  if (!context) {
    throw new Error('useQrModal must be used within a QrProvider');
  }
  return context;
};
