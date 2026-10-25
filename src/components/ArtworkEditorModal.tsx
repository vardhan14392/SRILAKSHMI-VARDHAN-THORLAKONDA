import React, { useState, useRef } from 'react';
import {
  PortfolioItem,
  validateArtworkData,
  generateEnhancedDescription,
} from '../utils/portfolioLogic';
import { optimizeImageFile } from '../utils/imageUtils';

interface ArtworkEditorModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PortfolioItem) => void;
  onDelete?: (id: string) => void;
  onRequestDelete?: (item: PortfolioItem) => void;
  isNew?: boolean;
}

export const ArtworkEditorModal: React.FC<ArtworkEditorModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onRequestDelete,
  isNew = false,
}) => {
  if (!isOpen) return null;

  // Editing state initialized from item or blank defaults
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState<PortfolioItem['category']>(
    item?.category || 'sculptures'
  );
  const [image, setImage] = useState(item?.image || '');
  const [medium, setMedium] = useState(
    item?.medium || 'Hand-carved Krishna Shila Stone'
  );
  const [dimensions, setDimensions] = useState(item?.dimensions || '');
  const [locationOrTrust, setLocationOrTrust] = useState(
    item?.locationOrTrust || ''
  );
  const [description, setDescription] = useState(item?.description || '');
  const [tags, setTags] = useState<string[]>(
    item?.tags && item.tags.length > 0 ? item.tags : ['Shilpa Shastra', 'Vastu']
  );
  const [tagInput, setTagInput] = useState('');

  // AI Description Assistant State
  const [descriptionTone, setDescriptionTone] = useState<
    'devotional' | 'technical' | 'grand' | 'concise'
  >('devotional');
  const [aiGeneratedText, setAiGeneratedText] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category labels helper
  const getCategoryLabel = (cat: PortfolioItem['category']) => {
    switch (cat) {
      case 'temple-art':
        return 'Temple Art';
      case 'murals':
        return 'Murals';
      case 'sculptures':
        return 'Sculptures';
      case 'general':
        return 'General Artwork';
    }
  };

  const [isOptimizingImage, setIsOptimizingImage] = useState(false);

  // Handle local image file upload with automatic client-side compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Photo size should be less than 15MB.',
        }));
        return;
      }
      setIsOptimizingImage(true);
      try {
        // Automatically compress and resize high-res camera photos down to optimized web dimensions (~100-150KB)
        const optimized = await optimizeImageFile(file, 1280, 1280, 0.82);
        setImage(optimized);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
          return next;
        });
      } catch (err) {
        console.warn('Image optimization fallback:', err);
        // Fallback to standard reader
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsOptimizingImage(false);
      }
    }
  };

  // Add tag
  const handleAddTag = (newTag: string) => {
    const cleaned = newTag.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Insert Shastra term into description
  const handleInsertTerm = (term: string) => {
    setDescription((prev) => {
      if (!prev.trim()) return term;
      return `${prev.trim()} with ${term}`;
    });
  };

  // Generate AI Description
  const handleGenerateDescription = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generated = generateEnhancedDescription(
        title,
        category,
        medium,
        descriptionTone
      );
      setAiGeneratedText(generated);
      setIsGeneratingAi(false);
    }, 350);
  };

  // Apply AI Description
  const handleApplyAiDescription = () => {
    if (aiGeneratedText) {
      setDescription(aiGeneratedText);
      setAiGeneratedText(null);
    }
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const artworkData: Partial<PortfolioItem> = {
      title,
      category,
      categoryLabel: getCategoryLabel(category),
      image,
      thumbnail: image,
      description,
      medium,
      dimensions: dimensions.trim() || undefined,
      locationOrTrust: locationOrTrust.trim() || undefined,
      tags,
    };

    const validation = validateArtworkData(artworkData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const finalItem: PortfolioItem = {
      id: item?.id || `art-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: getCategoryLabel(category),
      image: image.trim(),
      thumbnail: image.trim(),
      description: description.trim(),
      medium: medium.trim(),
      dimensions: dimensions.trim() || undefined,
      locationOrTrust: locationOrTrust.trim() || undefined,
      tags,
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <div className="bg-[#FDFBF7] rounded-xl max-w-5xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-[#D4AF37] relative flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#270C0C] text-[#FAF4DE] px-6 py-4 border-b border-[#D4AF37]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-sm">
              <i className="fa-solid fa-paintbrush"></i>
            </div>
            <div>
              <h3 id="editor-title" className="font-heading text-lg font-bold text-white">
                {isNew ? 'Upload Work Picture' : 'Edit Work Picture'}
              </h3>
              <p className="text-[11px] text-stone-300">
                Thorlakonda Guravaiah · Sree Guru Arts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C85A17] text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            aria-label="Close editor"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <form onSubmit={handleSave} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Photo Uploader & Live Preview */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                Artwork Photo & Live Preview *
              </label>

              {/* Photo Preview Container */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/90 border-2 border-[#D4AF37]/50 shadow-md flex items-center justify-center group">
                {image ? (
                  <img
                    src={image}
                    alt={title || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setErrors((prev) => ({
                        ...prev,
                        image: 'Unable to load photo from this URL. Please verify the link or upload a file.',
                      }));
                    }}
                  />
                ) : (
                  <div className="text-center p-4 text-stone-400">
                    <i className="fa-solid fa-image text-3xl mb-2"></i>
                    <p className="text-xs">No image provided</p>
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-[#270C0C]/85 text-[#FAF4DE] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#D4AF37]/40">
                  {getCategoryLabel(category)}
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs">
                  <div className="font-semibold truncate">{title || 'Untitled Creation'}</div>
                  <div className="text-[11px] text-[#FAF4DE]/80 truncate italic">{medium}</div>
                </div>
              </div>

              {errors.image && (
                <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.image}</span>
                </p>
              )}
            </div>

            {/* Photo Input Controls */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo URL (Web Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
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
                    className="w-full px-3 py-1.5 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Upload Local File Trigger */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isOptimizingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded border border-stone-300 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isOptimizingImage ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-[#C85A17]"></i>
                      <span>Optimizing Photo...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up text-[#C85A17]"></i>
                      <span>Upload Local Photo File</span>
                    </>
                  )}
                </button>
              </div>


            </div>

            {/* Medium & Dimensions Fields */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Medium & Technique *
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. Krishna Shila Stone / 24K Gold Leaf & Mineral Fresco"
                  className="w-full px-3 py-2 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.medium && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.medium}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dimensions / Scale
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 5 ft Height x 3 ft Width"
                    className="w-full px-3 py-1.5 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Temple / Consecration
                  </label>
                  <input
                    type="text"
                    value={locationOrTrust}
                    onChange={(e) => setLocationOrTrust(e.target.value)}
                    placeholder="e.g. Tirupati Sanctum"
                    className="w-full px-3 py-1.5 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Category, Description Editing Tools & AI Enhancement */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & Category Row */}
            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Artwork Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Maha Ganapati Sanctum Sculpture"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-[#3B1414] bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Portfolio Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'sculptures', label: 'Sculptures' },
                      { id: 'temple-art', label: 'Temple Art' },
                      { id: 'murals', label: 'Murals' },
                      { id: 'general', label: 'General Artwork' },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-2.5 text-xs rounded border transition-colors cursor-pointer ${
                        category === cat.id
                          ? 'bg-[#3B1414] text-[#FAF4DE] font-semibold border-[#3B1414]'
                          : 'bg-[#FDFBF7] text-stone-700 border-stone-300 hover:border-[#D4AF37]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Description / Notes */}
            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700">
                  Notes / Internal Description <span className="text-stone-400 font-normal">(optional - gallery displays only pictures)</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  {description.length} chars
                </span>
              </div>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes regarding the deity or sanctum..."
                className="w-full px-3.5 py-2.5 text-xs text-stone-800 bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37] leading-relaxed"
              ></textarea>

            </div>

            {/* Tags Editor */}
            <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-2.5">
              <label className="block text-xs font-semibold text-stone-700">
                Artwork Tags
              </label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs bg-[#FAF4DE] text-[#3B1414] px-2.5 py-1 rounded-md border border-[#D4AF37]/30"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-600 cursor-pointer"
                      aria-label={`Remove tag ${t}`}
                    >
                      <i className="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Type tag and press Add..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded border border-stone-300 cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                {!isNew && (onRequestDelete || onDelete) && item && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onRequestDelete) {
                        onClose();
                        onRequestDelete(item);
                      } else if (onDelete) {
                        onDelete(item.id);
                        onClose();
                      }
                    }}
                    className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    <span>Delete Artwork</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-xs font-bold uppercase tracking-wider rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Artwork Changes</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
