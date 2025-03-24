
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WarningAlertProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

const WarningAlert: React.FC<WarningAlertProps> = ({ 
  message, 
  onClose,
  className 
}) => {
  return (
    <div className={cn(
      "bg-white border-l-4 border-trackscore-warning rounded-lg p-4 shadow-soft animate-slide-down flex items-start",
      className
    )}>
      <AlertTriangle className="w-5 h-5 text-trackscore-warning flex-shrink-0 mt-0.5" />
      <div className="ml-3 flex-grow">
        <h3 className="text-sm font-medium text-trackscore-warning">Warning:</h3>
        <div className="mt-1 text-sm text-slate-600">
          {message}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          className="ml-auto flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default WarningAlert;
