import React, { useState, useRef } from 'react';
import { PortfolioItem, validateArtworkData } from '../utils/portfolioLogic';
import { optimizeImageFile } from '../utils/imageUtils';

interface UploadWorkStudioProps {
  onPublish: (item: PortfolioItem) => void;
  onCancel?: () => void;
}


export const UploadWorkStudio: React.FC<UploadWorkStudioProps> = ({ onPublish, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioItem['category']>('sculptures');
  const [image, setImage] = useState('');
  const [medium, setMedium] = useState('Hand-carved Krishna Shila Stone');
  const [dimensions, setDimensions] = useState('');
  const [locationOrTrust, setLocationOrTrust] = useState('');

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryLabel = (cat: PortfolioItem['category']) => {
    switch (cat) {
      case 'temple-art':
        return 'Temple Art & Gopurams';
      case 'murals':
        return 'Sacred Murals & Gold Leaf';
      case 'sculptures':
        return 'Deity Sculptures & Idols';
      case 'general':
        return 'Custom Fine Art';
    }
  };

  // Process file upload with client-side compression
  const processUploadedFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image file.' }));
      return;
    }

    setIsOptimizing(true);
    try {
      const optimized = await optimizeImageFile(file, 1600, 1600, 0.85);
      setImage(optimized);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        return next;
      });
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<PortfolioItem> = {
      title,
      category,
      categoryLabel: getCategoryLabel(category),
      image,
      thumbnail: image,
      description: '', // No description required or displayed per user request
      medium,
      dimensions: dimensions.trim() || undefined,
      locationOrTrust: locationOrTrust.trim() || undefined,
      tags: [getCategoryLabel(category)],
    };

    const validation = validateArtworkData(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newItem: PortfolioItem = {
      id: `work-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: getCategoryLabel(category),
      image: image.trim(),
      thumbnail: image.trim(),
      description: '', // Clean empty description: only pictures of works shown
      medium: medium.trim(),
      dimensions: dimensions.trim() || undefined,
      locationOrTrust: locationOrTrust.trim() || undefined,
      tags: [getCategoryLabel(category)],
    };

    onPublish(newItem);

    // Reset fields
    setTitle('');
    setImage('');
    setDimensions('');
    setLocationOrTrust('');
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#D4AF37] shadow-xl my-6 animate-fadeIn">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C85A17]">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span>Thorlakonda Guravaiah · Master Artist Upload</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-[#3B1414] mt-1">
            Upload Work Picture
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            Upload high-resolution pictures of your temple artwork. Only your pictures of works are showcased in the Arts Work gallery.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
            <span>Close</span>
          </button>
        )}
      </div>

      <form onSubmit={handlePublish} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Dropzone & Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              1. Work Picture *
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                Clear photo
              </button>
            )}
          </div>

          {/* Interactive Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[4/3] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-[#C85A17] bg-[#FAF4DE]'
                : image
                ? 'border-[#D4AF37] bg-stone-900 shadow-inner'
                : 'border-stone-300 bg-[#FDFBF7] hover:border-[#D4AF37] hover:bg-[#FAF4DE]/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {image ? (
              <>
                <img
                  src={image}
                  alt="Work preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100">
                  <i className="fa-solid fa-camera-rotate text-2xl mb-1.5 text-[#D4AF37]"></i>
                  <span className="text-xs font-semibold">Click to choose a different picture</span>
                </div>
              </>
            ) : isOptimizing ? (
              <div className="py-12 text-center">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-[#C85A17] mb-2"></i>
                <div className="text-xs font-bold text-[#3B1414]">Processing Picture...</div>
                <div className="text-[11px] text-stone-500">Optimizing for crisp full-resolution display</div>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-2xl mb-3 border border-[#D4AF37] shadow-sm">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div className="text-sm font-bold text-[#3B1414]">
                  Upload Your Artwork Picture
                </div>
                <div className="text-xs text-stone-600 mt-1">
                  Drag & drop or <span className="text-[#C85A17] font-semibold underline">browse from device / camera</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-2">
                  High-resolution photo (JPG, PNG, WebP)
                </div>
              </div>
            )}
          </div>

          {errors.image && (
            <p className="text-xs text-red-600 flex items-center gap-1.5">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errors.image}</span>
            </p>
          )}

          {/* Web Image Link Input */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Or paste an Image Web URL:
            </label>
            <input
              type="url"
              value={image.startsWith('data:') ? '' : image}
              onChange={(e) => {
                setImage(e.target.value);
                if (errors.image) {
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.image;
                    return n;
                  });
                }
              }}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>


        </div>

        {/* Right Column: Work Information (Picture Title, Category, Medium - No Description) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              2. Work Picture Information
            </label>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Picture / Artwork Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n.title;
                      return n;
                    });
                  }
                }}
                placeholder="e.g. Sri Venkateswara Swamy Consecrated Deity"
                className="w-full px-3.5 py-2.5 text-sm font-semibold text-[#3B1414] bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]"></i>
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Category & Medium Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PortfolioItem['category'])}
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="sculptures">Deity Sculptures & Idols</option>
                  <option value="temple-art">Temple Art & Gopurams</option>
                  <option value="murals">Sacred Murals & Gold Leaf</option>
                  <option value="general">Custom Fine Art</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Medium / Material *
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => {
                    setMedium(e.target.value);
                    if (errors.medium) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.medium;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. Krishna Shila Stone / 24K Gold Leaf"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.medium && (
                  <p className="text-xs text-red-600 mt-1">{errors.medium}</p>
                )}
              </div>
            </div>

            {/* Dimensions & Temple / Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dimensions / Scale <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 6 ft Height x 3 ft Width"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Temple / Commission Location <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={locationOrTrust}
                  onChange={(e) => setLocationOrTrust(e.target.value)}
                  placeholder="e.g. Tirupati Devasthanam Project"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Confirmation Note about Pure Picture Showcase */}
            <div className="p-3.5 bg-[#FAF4DE]/80 rounded-lg border border-[#D4AF37]/50 text-xs text-[#3B1414] flex items-start gap-2.5">
              <i className="fa-solid fa-circle-check text-emerald-600 mt-0.5 text-sm"></i>
              <div>
                <strong className="font-semibold block text-[#270C0C]">
                  Pure Picture Presentation
                </strong>
                <span>
                  No descriptions are displayed with your works. The gallery presents only your pictures of works in high definition for devotees and patrons to admire.
                </span>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500">
              Only Thorlakonda Guravaiah is authorized to upload.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 sm:flex-initial py-2.5 px-4 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-md border border-stone-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="flex-1 sm:flex-initial py-2.5 px-6 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#e0be48] hover:to-[#c99411] text-[#270C0C] text-xs font-bold uppercase tracking-wider rounded-md shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>Upload to Arts Work</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
