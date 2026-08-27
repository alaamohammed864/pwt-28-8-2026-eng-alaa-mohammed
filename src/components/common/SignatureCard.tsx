import React from 'react';
import { DigitalSignature } from '../../types';

export interface SignatureCardProps {
  roleTitle: string;
  roleTitleAr?: string;
  signature: DigitalSignature;
  onOpenPad: () => void;
  onClear?: () => void;
  readOnly?: boolean;
  accentColor?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'blue';
  compact?: boolean;
}

export const SignatureCard: React.FC<SignatureCardProps> = ({
  roleTitle,
  roleTitleAr,
  signature,
  onOpenPad,
  onClear,
  readOnly = false,
  accentColor = 'cyan',
  compact = false,
}) => {
  const isSigned = signature?.signed && (signature.name || signature.signatureData);

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'rose':
        return {
          border: 'border-rose-500/30',
          bg: 'bg-rose-950/20',
          text: 'text-rose-400',
          badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          button: 'bg-rose-500 hover:bg-rose-400 text-black',
        };
      case 'amber':
        return {
          border: 'border-amber-500/30',
          bg: 'bg-amber-950/20',
          text: 'text-amber-400',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          button: 'bg-amber-500 hover:bg-amber-400 text-black',
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/30',
          bg: 'bg-emerald-950/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
        };
      default:
        return {
          border: 'border-cyan-500/30',
          bg: 'bg-cyan-950/20',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
          button: 'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div
      className={`rounded-xl border transition-all duration-200 backdrop-blur-md overflow-hidden flex flex-col justify-between ${
        isSigned ? 'bg-[#0a0f1d]/90 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-[#0c0d18]/80 border-white/10 hover:border-white/20'
      } ${compact ? 'p-3 gap-2' : 'p-4 gap-3'}`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className={`text-xs font-bold block ${styles.text}`}>
            {roleTitle}
          </span>
          {roleTitleAr && (
            <span className="text-[10px] text-slate-400 font-arabic block leading-tight">
              {roleTitleAr}
            </span>
          )}
        </div>

        {isSigned ? (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-xs">verified</span>
            AUTHORIZED
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">hourglass_empty</span>
            PENDING SIGN-OFF
          </span>
        )}
      </div>

      {/* Signature Preview Canvas / Image Box */}
      <div
        onClick={!readOnly ? onOpenPad : undefined}
        className={`relative rounded-lg border flex flex-col items-center justify-center transition-all ${
          isSigned
            ? 'bg-black/50 border-cyan-500/30 h-24 p-2 cursor-pointer hover:border-cyan-400/60'
            : 'bg-black/30 border-dashed border-white/15 h-20 p-3 cursor-pointer hover:bg-white/[0.03] hover:border-cyan-500/40'
        }`}
      >
        {isSigned ? (
          <>
            {signature.signatureData ? (
              <img
                src={signature.signatureData}
                alt={`${signature.name} signature`}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_4px_rgba(6,182,212,0.4)]"
              />
            ) : (
              <div className="text-lg italic font-serif text-cyan-300 tracking-wider">
                {signature.name}
              </div>
            )}

            {/* Verification Watermark in background */}
            <div className="absolute bottom-1 right-2 text-[8px] font-mono text-cyan-400/40 flex items-center gap-0.5 pointer-events-none">
              <span className="material-symbols-outlined text-[10px]">lock</span>
              <span>{signature.verificationHash ? signature.verificationHash.substring(0, 16) + '...' : 'DIGITALLY VERIFIED'}</span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-1">
            <div className="w-7 h-7 mx-auto rounded-full bg-white/5 border border-white/10 text-cyan-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">draw</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-300 block">Click to Sign in Browser</span>
            <span className="text-[9px] text-slate-500 font-arabic block">اضغط لتوقيع التصريح إلكترونياً</span>
          </div>
        )}
      </div>

      {/* Signatory Info & Metadata */}
      <div className="space-y-0.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[10px]">Name:</span>
          <span className="font-semibold text-slate-100 text-[11px] truncate max-w-[170px]">
            {isSigned ? signature.name : 'Awaiting Signatory'}
          </span>
        </div>

        {signature?.title && (
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Title:</span>
            <span className="text-slate-300 truncate max-w-[170px]">{signature.title}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Date / Time:</span>
          <span className="font-mono text-slate-300">
            {isSigned ? `${signature.date || 'Today'} ${signature.time || ''}` : '---'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={onOpenPad}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 ${styles.button}`}
          >
            <span className="material-symbols-outlined text-sm font-bold">
              {isSigned ? 'edit_note' : 'draw'}
            </span>
            {isSigned ? 'Update / Re-sign' : 'Sign & Authorize / توقيع'}
          </button>

          {isSigned && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="py-1.5 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors"
              title="Clear / Revoke Signature"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
