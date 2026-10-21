import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`} role="alert">
      <div className="alert-icon">
        {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      </div>
      <div>{message}</div>
    </div>
  );
};
