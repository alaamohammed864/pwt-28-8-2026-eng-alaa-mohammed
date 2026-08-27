import React from 'react';
import { DigitalSignature } from '../../types';
import { SignaturePad } from '../common/SignaturePad';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sig: DigitalSignature) => void;
  title: string;
  roleName: string;
  defaultName?: string;
  initialSignature?: DigitalSignature;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  roleName,
  defaultName = '',
  initialSignature,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-xl">
        <SignaturePad
          title={title}
          subtitle={`Designated Role: ${roleName}`}
          initialName={defaultName || initialSignature?.name}
          initialRole={roleName}
          initialSignature={initialSignature}
          onSave={(sig) => {
            onSave(sig);
            onClose();
          }}
          onCancel={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
