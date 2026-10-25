import React, { useState } from 'react';
import {
  verifyArtistPasscode,
  DEFAULT_ARTIST_PASSCODE,
} from '../utils/auth';

interface ArtistAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  titleMessage?: string;
}

export const ArtistAuthModal: React.FC<ArtistAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  titleMessage = 'Master Artist & Sthapati Access',
}) => {
  if (!isOpen) return null;

  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passcode.trim()) {
      setError('Please enter the Master Artist Passcode.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const isValid = verifyArtistPasscode(passcode);
      setIsVerifying(false);
      if (isValid) {
        onSuccess();
        onClose();
      } else {
        setError('Incorrect passcode. Please enter the valid artist passcode or use default: ' + DEFAULT_ARTIST_PASSCODE);
      }
    }, 200);
  };

  const handleUseDefault = () => {
    setPasscode(DEFAULT_ARTIST_PASSCODE);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="bg-[#FDFBF7] rounded-xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#D4AF37] relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#270C0C] text-[#FAF4DE] px-6 py-5 border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3B1414] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-inner">
              <i className="fa-solid fa-lock text-base"></i>
            </div>
            <div>
              <h3 id="auth-modal-title" className="font-heading text-lg font-bold text-white leading-tight">
                {titleMessage}
              </h3>
              <p className="text-[11px] text-[#D4AF37] font-medium mt-0.5">
                Thorlakonda Guravaiah · Sree Guru Arts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C85A17] text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50/80 p-3.5 rounded-lg border border-amber-200/80 text-xs text-amber-950 leading-relaxed">
            <div className="flex items-start gap-2">
              <i className="fa-solid fa-shield-halved text-[#C85A17] mt-0.5 text-sm shrink-0"></i>
              <div>
                <strong className="font-semibold block text-[#3B1414] mb-0.5">
                  Artist Only Access Protected
                </strong>
                <span>
                  To ensure authentic temple provenance, only Master Artist Thorlakonda Guravaiah is authorized to upload new artworks, edit descriptions, or delete pieces from this gallery.
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Enter Master Artist Passcode *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter passcode..."
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-white rounded-lg border border-stone-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                <i className="fa-solid fa-circle-exclamation text-xs shrink-0"></i>
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Quick Default Passcode Helper for Ease of Use */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <span>
              Default Artist Passcode: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-[#3B1414] font-bold border border-stone-200">{DEFAULT_ARTIST_PASSCODE}</code>
            </span>
            <button
              type="button"
              onClick={handleUseDefault}
              className="text-[#C85A17] hover:text-[#3B1414] font-semibold text-xs cursor-pointer hover:underline"
            >
              Fill Default
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#c29e2f] hover:to-[#a27407] text-[#270C0C] text-xs font-bold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-key"></i>
                  <span>Unlock Artist Studio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
