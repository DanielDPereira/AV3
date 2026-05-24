import React, { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
    >
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-xl flex flex-col w-full"
        style={{ maxWidth: '500px', maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between p-lg border-b border-outline-variant shrink-0">
          <h2 className="text-h3 font-h3 text-on-surface">{title}</h2>
          <button 
            onClick={onClose}
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-variant shrink-0 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        <div className="p-lg overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
