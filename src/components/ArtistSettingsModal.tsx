import React, { useState } from 'react';
import {
  setArtistPasscode,
  resetArtistPasscode,
  DEFAULT_ARTIST_PASSCODE,
} from '../utils/auth';

interface ArtistSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onRequestResetPortfolio: () => void;
  onRequestResetPortrait: () => void;
}

export const ArtistSettingsModal: React.FC<ArtistSettingsModalProps> = ({
  isOpen,
  onClose,
  onLogout,
  onRequestResetPortfolio,
  onRequestResetPortrait,
}) => {
  if (!isOpen) return null;

  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (newPasscode.length < 4) {
      setMsg({ type: 'error', text: 'New passcode must be at least 4 characters.' });
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setMsg({ type: 'error', text: 'Passcodes do not match.' });
      return;
    }

    const res = setArtistPasscode(newPasscode);
    if (res.success) {
      setMsg({ type: 'success', text: 'Artist passcode updated successfully!' });
      setNewPasscode('');
      setConfirmPasscode('');
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to update passcode.' });
    }
  };

  const handleResetToDefault = () => {
    resetArtistPasscode();
    setMsg({ type: 'success', text: `Passcode restored to default: ${DEFAULT_ARTIST_PASSCODE}` });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div
        className="bg-[#FDFBF7] rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-[#D4AF37] relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#270C0C] text-[#FAF4DE] px-6 py-4 border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3B1414] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <h3 id="settings-dialog-title" className="font-heading text-lg font-bold text-white">
                Master Artist Studio Settings
              </h3>
              <p className="text-[11px] text-stone-300">
                Thorlakonda Guravaiah · Security & Portfolio Controls
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Session Info */}
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-sm">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  Artist Mode Active
                </h4>
                <p className="text-[11px] text-emerald-700">
                  You have full authorization to upload, edit, and delete works.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-900 bg-white hover:bg-red-50 border border-red-200 rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-lock"></i>
              <span>Lock / Log Out</span>
            </button>
          </div>

          {/* Change Passcode Section */}
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#3B1414] uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-key text-[#C85A17]"></i>
              <span>Change Master Artist Passcode</span>
            </h4>

            {msg && (
              <div
                className={`p-3 rounded text-xs leading-relaxed flex items-center gap-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <i
                  className={`fa-solid ${
                    msg.type === 'success' ? 'fa-circle-check text-emerald-600' : 'fa-circle-exclamation text-red-600'
                  }`}
                ></i>
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePasscode} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Artist Passcode (min 4 chars)
                </label>
                <input
                  type="password"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new passcode"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirm New Passcode
                </label>
                <input
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Confirm new passcode"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-[11px] text-stone-500 hover:text-[#C85A17] hover:underline cursor-pointer"
                >
                  Reset Passcode to Default ({DEFAULT_ARTIST_PASSCODE})
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </div>

          {/* Reset Shortcuts */}
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#3B1414] uppercase tracking-wider flex items-center gap-2">
              <i className="fa-solid fa-arrows-rotate text-[#C85A17]"></i>
              <span>Restoration & Maintenance</span>
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestResetPortfolio();
                }}
                className="flex-1 p-3 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#C85A17] flex items-center gap-1.5">
                  <i className="fa-solid fa-rotate-left"></i>
                  <span>Restore Original Portfolio</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Reverts all gallery items back to initial shastric masterworks.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestResetPortrait();
                }}
                className="flex-1 p-3 bg-stone-50 hover:bg-stone-100 rounded border border-stone-200 text-left transition-colors cursor-pointer group"
              >
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#C85A17] flex items-center gap-1.5">
                  <i className="fa-solid fa-user-gear"></i>
                  <span>Reset Artist Portrait</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Restores Thorlakonda Guravaiah's master photo to default.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-100/90 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 italic">
            Sree Guru Arts Management System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-300 rounded cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
