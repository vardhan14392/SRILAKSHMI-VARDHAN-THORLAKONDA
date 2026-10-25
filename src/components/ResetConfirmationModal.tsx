import React from 'react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isResetting?: boolean;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isResetting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
    >
      <div
        className="bg-[#FDFBF7] rounded-xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-500/40 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#270C0C] text-[#FAF4DE] px-5 py-4 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-500 flex items-center justify-center text-red-400">
              <i className="fa-solid fa-trash-can text-sm"></i>
            </div>
            <div>
              <h3 id="reset-dialog-title" className="font-heading text-base font-bold text-white">
                Clear All Work Pictures
              </h3>
              <p className="text-[11px] text-stone-300">Master Artist Action</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-stone-700 leading-relaxed">
            Are you sure you want to clear all pictures currently in your Arts Work portfolio?
          </p>
          <div className="p-3 bg-red-50 rounded border border-red-200 text-[11px] text-red-800 leading-relaxed flex items-start gap-2">
            <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
            <span>
              This will remove all artwork pictures from device storage. You can upload fresh pictures anytime.
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-stone-100/90 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isResetting}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isResetting}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash-can"></i>
                <span>Yes, Clear All Pictures</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
