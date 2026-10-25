import React, { useState, useRef } from 'react';
import { optimizeImageFile } from '../utils/imageUtils';
import { MasterSculptorArtwork } from './MasterSculptorArtwork';

export interface ArtistImageEditorModalProps {
  isOpen: boolean;
  currentImage: string;
  onClose: () => void;
  onSave: (newImageUrl: string) => void;
  onReset: () => void;
}

export const ARTIST_PHOTO_PRESETS = [
  {
    id: 'preset-1',
    title: 'Master Temple Sculptor at Workshop',
    desc: 'Artisan hand-carving sacred stone deity sculpture in temple atelier',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'preset-2',
    title: 'Sacred Sanctum Stone Iconometry',
    desc: 'Fine chisel work on traditional Krishna Shila black stone idol',
    url: 'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'preset-3',
    title: 'Dravidian Temple Sthapati & Gopuram',
    desc: 'Master architect overseeing monumental Dravidian temple sanctum',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'preset-4',
    title: 'Consecrated Deities & Divine Shrines',
    desc: 'Sculpted divine idol with sacred prabha mandala and traditional adornment',
    url: 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1000&q=85',
  },
];

export const ArtistImageEditorModal: React.FC<ArtistImageEditorModalProps> = ({
  isOpen,
  currentImage,
  onClose,
  onSave,
  onReset,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(currentImage);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessingFile(true);
    try {
      const optimized = await optimizeImageFile(file, 1200, 1200, 0.82);
      setSelectedImage(optimized);
    } catch (err) {
      console.error('Failed to process image:', err);
      setErrorMessage('Could not process this image. Please try another file or enter an image URL.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedImage(customUrl.trim());
    setCustomUrl('');
  };

  const handleSave = () => {
    onSave(selectedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6EE] rounded-xl max-w-2xl w-full border-2 border-[#D4AF37] shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2A0808] to-[#3B1414] px-6 py-4 border-b border-[#D4AF37]/40 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <i className="fa-solid fa-camera"></i>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white tracking-wide">
                Replace Artist Photo
              </h3>
              <p className="text-xs text-amber-200/80">
                THORLAKONDA GURAVAIAH · Master Temple Sculptor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Current / New Preview */}
          <div className="flex flex-col sm:flex-row gap-5 items-center bg-white p-4 rounded-lg border border-stone-200 shadow-sm">
            <div className="relative w-36 h-44 rounded-lg overflow-hidden border-2 border-[#D4AF37] shadow-md shrink-0 bg-stone-100">
              <MasterSculptorArtwork
                customImageUrl={selectedImage}
                className="w-full h-full"
              />
              <span className="absolute bottom-1 right-1 bg-black/70 text-[#D4AF37] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Preview
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-[#8B2500] rounded mb-1">
                Selected Photo
              </span>
              <h4 className="font-heading font-bold text-base text-[#2A0808]">
                Master Temple Artist Portrait
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Upload your real photograph, enter an image web URL, or choose one of our handcrafted traditional temple sculptor presets below.
              </p>
              {isProcessingFile && (
                <div className="mt-2 text-xs text-[#C85A17] font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Optimizing photo...</span>
                </div>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload Method 1: Local File Drag & Drop */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Upload from Device (Computer / Phone)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#D4AF37] bg-amber-50/70'
                  : 'border-stone-300 hover:border-[#D4AF37] bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-[#FAF4DE] text-[#C85A17] mx-auto flex items-center justify-center text-lg mb-2">
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <p className="text-sm font-semibold text-[#2A0808]">
                Click to browse or drag & drop photo here
              </p>
              <p className="text-xs text-stone-500 mt-1">
                PNG, JPG, WebP supported · Automatically optimized for crisp display
              </p>
            </div>
          </div>

          {/* Upload Method 2: Web URL */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Or Enter Image Web URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/artist-photo.jpg"
                className="flex-1 px-3 py-2 text-sm rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-white"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 bg-[#3B1414] hover:bg-[#2A0808] text-white text-xs font-semibold rounded transition-colors"
              >
                Apply URL
              </button>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Or Select Traditional Temple Sculptor Presets
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ARTIST_PHOTO_PRESETS.map((preset) => {
                const isCurrent = selectedImage === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedImage(preset.url)}
                    className={`text-left p-2.5 rounded-lg border text-xs flex gap-3 items-center transition-all ${
                      isCurrent
                        ? 'border-[#D4AF37] bg-amber-50/80 ring-2 ring-[#D4AF37]/50 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded object-cover shrink-0 border border-stone-200"
                    />
                    <div className="overflow-hidden">
                      <div className="font-bold text-[#2A0808] truncate text-[11px]">
                        {preset.title}
                      </div>
                      <div className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
                        {preset.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="text-xs text-stone-600 hover:text-red-700 font-medium underline transition-colors"
          >
            Reset to Default Photo
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded border border-stone-300 text-stone-700 hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-105 text-[#2A0808] shadow-md transition-all"
            >
              Save New Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
