import React from 'react';
import { PortfolioItem } from '../utils/portfolioLogic';

interface DeleteConfirmationModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="bg-[#FDFBF7] rounded-xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-red-800/40 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#270C0C] text-[#FAF4DE] px-5 py-4 border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-600/50 flex items-center justify-center text-red-400">
              <i className="fa-solid fa-triangle-exclamation text-sm"></i>
            </div>
            <div>
              <h3 id="delete-dialog-title" className="font-heading text-base font-bold text-white">
                Delete Temple Artwork
              </h3>
              <p className="text-[11px] text-stone-300">Permanent removal confirmation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Target Item Preview */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-16 h-16 rounded object-cover border border-stone-300 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-[#C85A17] tracking-wider block">
                {item.categoryLabel}
              </span>
              <h4 className="font-heading font-bold text-sm text-[#3B1414] truncate">
                {item.title}
              </h4>
              <p className="text-xs text-stone-500 italic truncate mt-0.5">{item.medium}</p>
            </div>
          </div>

          <div className="text-xs text-stone-600 leading-relaxed bg-red-50/70 p-3 rounded border border-red-200/60">
            <p className="font-medium text-red-900 mb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-exclamation text-red-600"></i>
              <span>Are you sure you want to delete this artwork?</span>
            </p>
            <p className="text-stone-600 text-[11px]">
              This will remove <strong>"{item.title}"</strong> and all its shastric descriptions from your active gallery.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 py-3.5 bg-stone-100/90 border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-trash-can"></i>
                <span>Confirm & Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
