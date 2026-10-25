import React, { useState, useEffect, useMemo } from 'react';
import {
  PORTFOLIO_ITEMS,
  ARTIST_INFO,
  CORE_SERVICES,
  TRUST_POINTS,
} from './data/portfolioData';
import { ArtworkEditorModal } from './components/ArtworkEditorModal';
import { UploadWorkStudio } from './components/UploadWorkStudio';
import { ArtistImageEditorModal } from './components/ArtistImageEditorModal';
import { MasterSculptorArtwork } from './components/MasterSculptorArtwork';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ResetConfirmationModal } from './components/ResetConfirmationModal';
import { ArtistAuthModal } from './components/ArtistAuthModal';
import { ArtistSettingsModal } from './components/ArtistSettingsModal';
import { getArtistAuthStatus, setArtistAuthStatus } from './utils/auth';
import {
  validateInquiryForm,
  filterPortfolioItems,
  generateWhatsAppLink,
  generateEmailLink,
  calculateProjectEstimate,
  updatePortfolioItem,
  addPortfolioItem,
  deletePortfolioItem,
  PortfolioItem,
  InquiryFormData,
} from './utils/portfolioLogic';
import {
  loadSavedPortfolio,
  saveSavedPortfolio,
  clearSavedPortfolio,
  loadArtistPortrait,
  saveArtistPortrait,
  resetArtistPortrait,
} from './utils/storage';

const DEFAULT_ARTIST_IMAGE = '';

export default function App() {
  // Navigation & Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Master Artist Authentication & Mode (Protects upload, edit, delete)
  const [isArtistMode, setIsArtistMode] = useState<boolean>(() => getArtistAuthStatus());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Master Artist & Sthapati Access');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // In-app Deletion & Reset Modals State (replaces blocked window.confirm)
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Portfolio Items State with IndexedDB Persistence & Fallback
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(PORTFOLIO_ITEMS);

  // Master Artist Portrait State (Persistent)
  const [artistPortrait, setArtistPortrait] = useState<string>(DEFAULT_ARTIST_IMAGE);
  const [isArtistPhotoModalOpen, setIsArtistPhotoModalOpen] = useState(false);

  // Load from IndexedDB / Storage on mount
  useEffect(() => {
    let mounted = true;
    loadSavedPortfolio(PORTFOLIO_ITEMS).then((loaded) => {
      if (mounted && loaded && loaded.length > 0) {
        setPortfolioItems(loaded);
      }
    });
    loadArtistPortrait(DEFAULT_ARTIST_IMAGE).then((savedImg) => {
      if (mounted && savedImg) {
        setArtistPortrait(savedImg);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Gallery View Mode ('gallery' | 'upload') and Newly Added Item Highlight
  const [galleryViewMode, setGalleryViewMode] = useState<'gallery' | 'upload'>('gallery');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Gallery Filter State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  // Photo & Description Editor State
  const [editorItem, setEditorItem] = useState<PortfolioItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewArtwork, setIsNewArtwork] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inquiry Form State
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    phone: '',
    email: '',
    service: 'Temple Sculptures & Murals',
    templeOrProjectLocation: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive Project Estimator State
  const [estimatorService, setEstimatorService] = useState('temple-sculptures');
  const [estimatorScale, setEstimatorScale] = useState<'small' | 'medium' | 'monumental'>('medium');

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Save Portfolio Item (Edit or Add) with IndexedDB & Quota Protection
  const handleSaveArtwork = async (savedItem: PortfolioItem) => {
    let updated: PortfolioItem[];
    if (isNewArtwork) {
      updated = addPortfolioItem(portfolioItems, savedItem);
      showToast(`Added "${savedItem.title}" to portfolio!`);
    } else {
      updated = updatePortfolioItem(portfolioItems, savedItem);
      showToast(`Updated "${savedItem.title}"!`);
      if (selectedItem?.id === savedItem.id) {
        setSelectedItem(savedItem);
      }
    }

    setPortfolioItems(updated);

    try {
      await saveSavedPortfolio(updated);
    } catch (err) {
      console.warn('Storage save warning:', err);
    }
  };

  // Handle artwork published directly from the Studio
  const handlePublishFromStudio = async (newItem: PortfolioItem) => {
    const updated = addPortfolioItem(portfolioItems, newItem);
    setPortfolioItems(updated);
    setRecentlyAddedId(newItem.id);
    setGalleryViewMode('gallery');
    setActiveCategory('all');
    setSearchQuery('');
    showToast(`Published "${newItem.title}" to Art Gallery!`);

    try {
      await saveSavedPortfolio(updated);
    } catch (err) {
      console.warn('Storage save warning:', err);
    }

    // Scroll smoothly to gallery showcase so artist sees newly added artwork
    setTimeout(() => {
      const el = document.getElementById('gallery');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 120);
  };

  // Master Artist Login / Logout Handlers
  const handleArtistLoginSuccess = () => {
    setIsArtistMode(true);
    setArtistAuthStatus(true);
    showToast('Master Artist Mode unlocked! You can now upload, edit, and delete temple works.');
  };

  const handleArtistLogout = () => {
    setIsArtistMode(false);
    setArtistAuthStatus(false);
    setGalleryViewMode('gallery');
    showToast('Locked Master Artist Mode. Switched to public visitor view.');
  };

  // Safe Delete Request (opens in-app DeleteConfirmationModal - no blocked window.confirm)
  const handleRequestDelete = (item: PortfolioItem) => {
    setItemToDelete(item);
  };

  // Confirmed Delete Execution
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeletingArtwork(true);
    const targetId = itemToDelete.id;
    const targetTitle = itemToDelete.title;

    const updated = deletePortfolioItem(portfolioItems, targetId);
    setPortfolioItems(updated);

    try {
      await saveSavedPortfolio(updated);
    } catch (err) {
      console.warn('Storage delete warning:', err);
    }

    if (selectedItem?.id === targetId) {
      setSelectedItem(null);
    }
    if (editorItem?.id === targetId) {
      setIsEditorOpen(false);
    }
    setIsDeletingArtwork(false);
    setItemToDelete(null);
    showToast(`Successfully removed "${targetTitle}" from portfolio.`);
  };

  // Delete Portfolio Item fallback
  const handleDeleteArtwork = async (id: string) => {
    const target = portfolioItems.find((p) => p.id === id);
    if (target) {
      handleRequestDelete(target);
    }
  };

  // Safe Reset Portfolio to Default Artworks (opens ResetConfirmationModal)
  const handleResetPortfolio = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetPortfolio = async () => {
    setPortfolioItems([]);
    await clearSavedPortfolio();
    setIsResetConfirmOpen(false);
    showToast('All work pictures cleared from portfolio.');
  };

  // Gated Upload Works handler
  const handleOpenUpload = () => {
    if (isArtistMode) {
      setGalleryViewMode('upload');
      scrollToSection('gallery');
    } else {
      setAuthModalMessage('Master Artist Verification: Only Thorlakonda Guravaiah can upload new temple works. Please enter your passcode.');
      setIsAuthModalOpen(true);
    }
  };

  // Save updated Artist Portrait
  const handleSaveArtistPortrait = async (newUrl: string) => {
    setArtistPortrait(newUrl);
    try {
      await saveArtistPortrait(newUrl);
    } catch (e) {
      console.warn('Could not persist artist portrait:', e);
    }
    showToast('Master Artist portrait updated successfully!');
  };

  // Reset Artist Portrait to default
  const handleResetArtistPortrait = async () => {
    setArtistPortrait(DEFAULT_ARTIST_IMAGE);
    try {
      await resetArtistPortrait();
    } catch (e) {
      console.warn('Could not reset artist portrait storage:', e);
    }
    showToast('Artist portrait restored to default.');
  };

  // Track scroll position for sticky header styling and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem && !isEditorOpen) {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, isEditorOpen]);

  // Filtered portfolio list
  const filteredItems = useMemo(() => {
    return filterPortfolioItems(portfolioItems, activeCategory, searchQuery);
  }, [portfolioItems, activeCategory, searchQuery]);

  // Current project estimate
  const currentEstimate = useMemo(() => {
    return calculateProjectEstimate(estimatorService, estimatorScale);
  }, [estimatorService, estimatorScale]);

  // Form input handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts correcting
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Handle Form Submission
  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateInquiryForm(formData);

    if (!validation.isValid) {
      setFormErrors(validation.errors as Record<string, string>);
      // Scroll to first error
      const firstErrorKey = Object.keys(validation.errors)[0];
      const errorElement = document.getElementById(`field-${firstErrorKey}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    // Simulate immediate processing
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 400);
  };

  // Reset form
  const handleResetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: 'Temple Sculptures & Murals',
      templeOrProjectLocation: '',
      message: '',
    });
    setFormSubmitted(false);
    setFormErrors({});
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-white">
      {/* Top Auspicious Banner */}
      <div
        className={`text-xs py-2 px-4 border-b transition-colors ${
          isArtistMode
            ? 'bg-[#1F0808] text-[#F4E5A9] border-[#D4AF37]/50 shadow-xs'
            : 'bg-[#270C0C] text-[#F4E5A9] border-[#D4AF37]/30'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-om text-xs text-[#D4AF37]"></i>
            {isArtistMode ? (
              <span className="flex items-center gap-1.5 font-semibold text-[#D4AF37]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Master Sthapati Mode Active · Thorlakonda Guravaiah (Upload & Edit Authorized)</span>
              </span>
            ) : (
              <>
                <span>Dedicated to Sacred Shilpa Shastra & Temple Artistry</span>
                <span className="hidden sm:inline text-[#D4AF37]/60">·</span>
                <span className="hidden sm:inline text-stone-300">Master Artist THORLAKONDA GURAVAIAH</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            {isArtistMode ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-[#D4AF37] hover:text-white flex items-center gap-1 transition-colors cursor-pointer font-medium"
                >
                  <i className="fa-solid fa-gear"></i>
                  <span>Studio Settings</span>
                </button>
                <button
                  onClick={handleArtistLogout}
                  className="text-stone-300 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer font-medium ml-1"
                >
                  <i className="fa-solid fa-lock"></i>
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMessage('Master Artist Verification');
                  setIsAuthModalOpen(true);
                }}
                className="text-[#D4AF37] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer font-semibold"
              >
                <i className="fa-solid fa-lock text-[10px]"></i>
                <span>Artist Portal Login</span>
              </button>
            )}
            <a
              href="tel:+919704926504"
              className="hover:text-white flex items-center gap-1.5 transition-colors hidden sm:flex"
              aria-label="Direct phone call to master artist"
            >
              <i className="fa-solid fa-phone text-[#D4AF37]"></i>
              <span className="font-medium">+91 9704926504</span>
            </a>
            <a
              href={ARTIST_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
              aria-label="Chat on WhatsApp with master artist"
            >
              <i className="fa-brands fa-whatsapp text-emerald-400"></i>
              <span className="font-medium">WhatsApp Available</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky Header / Navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FDFBF7]/95 backdrop-blur-md shadow-md border-b border-[#D4AF37]/30 py-3'
            : 'bg-[#FDFBF7] border-b border-stone-200 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#D4AF37] rounded"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#C85A17] to-[#3B1414] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#270C0C] flex items-center justify-center text-[#D4AF37] font-serif text-lg font-bold">
                SG
              </div>
            </div>
            <div>
              <span className="block font-heading text-xl sm:text-2xl font-bold tracking-wider text-[#3B1414] group-hover:text-[#C85A17] transition-colors">
                Sree Guru Arts
              </span>
              <span className="block text-[10px] sm:text-xs uppercase tracking-widest text-[#C85A17] font-medium">
                Thorlakonda Guravaiah
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
            <button
              onClick={() => scrollToSection('home')}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37]"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37]"
            >
              About Artist
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37]"
            >
              Services
            </button>
            <button
              onClick={() => {
                setGalleryViewMode('gallery');
                scrollToSection('gallery');
              }}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37] font-semibold text-[#3B1414]"
            >
              Arts Work
            </button>
            <button
              onClick={() => scrollToSection('why-us')}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37]"
            >
              Why Choose Us
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="hover:text-[#C85A17] transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-[#D4AF37]"
            >
              Contact
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-2.5">
            {isArtistMode ? (
              <>
                <button
                  onClick={() => {
                    setGalleryViewMode('upload');
                    scrollToSection('gallery');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#270C0C] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#e0be48] hover:to-[#c99411] rounded-md transition-all shadow-sm hover:shadow cursor-pointer"
                  title="Upload your artwork with custom sacred description"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                  <span>+ Upload Work</span>
                </button>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3B1414] bg-[#FAF4DE] border border-[#D4AF37] rounded-md hover:bg-[#F3E7C4] transition-colors shadow-sm cursor-pointer"
                  title="Master Artist Studio Settings"
                >
                  <i className="fa-solid fa-shield-halved text-[#C85A17]"></i>
                  <span>Artist Mode</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMessage('Master Artist & Sthapati Access: Only Thorlakonda Guravaiah can upload or edit temple artworks. Please enter passcode.');
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3B1414] border border-stone-300 hover:border-[#D4AF37] bg-white hover:bg-[#FAF4DE] rounded-md transition-colors shadow-xs cursor-pointer"
                title="Master Artist Sign-In"
              >
                <i className="fa-solid fa-lock text-stone-500"></i>
                <span>Artist Login</span>
              </button>
            )}
            <a
              href="tel:+919704926504"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3B1414] border border-[#D4AF37] rounded-md hover:bg-[#FAF4DE] transition-colors shadow-sm"
              title="Call Thorlakonda Guravaiah directly"
            >
              <i className="fa-solid fa-phone text-[#C85A17]"></i>
              <span>Call Now</span>
            </a>
            <a
              href={ARTIST_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-all shadow-sm hover:shadow"
            >
              <i className="fa-brands fa-whatsapp text-sm"></i>
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-stone-700 hover:text-[#C85A17] hover:bg-stone-100 transition-colors focus-visible:outline-2 focus-visible:outline-[#D4AF37]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FDFBF7] border-b border-stone-200 px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
            <nav className="flex flex-col gap-2.5 text-base font-medium text-stone-800">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors"
              >
                About the Artist
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors"
              >
                Core Services
              </button>
              <button
                onClick={() => {
                  setGalleryViewMode('gallery');
                  scrollToSection('gallery');
                }}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors font-semibold text-[#3B1414]"
              >
                Arts Work
              </button>
              {isArtistMode ? (
                <>
                  <button
                    onClick={() => {
                      setGalleryViewMode('upload');
                      scrollToSection('gallery');
                    }}
                    className="text-left py-2 px-3 rounded bg-[#FAF4DE] text-[#C85A17] font-semibold transition-colors flex items-center justify-between"
                  >
                    <span>Upload Work Pictures</span>
                    <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="text-left py-2 px-3 rounded text-stone-700 hover:bg-stone-100 transition-colors flex items-center justify-between"
                  >
                    <span>Master Studio Settings</span>
                    <i className="fa-solid fa-gear text-xs text-[#C85A17]"></i>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMessage('Master Artist & Sthapati Access');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-left py-2 px-3 rounded text-stone-600 hover:bg-stone-100 transition-colors flex items-center justify-between"
                >
                  <span>Master Artist Portal Login</span>
                  <i className="fa-solid fa-lock text-xs text-stone-400"></i>
                </button>
              )}
              <button
                onClick={() => scrollToSection('why-us')}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors"
              >
                Why Choose Sree Guru Arts
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left py-2 px-3 rounded hover:bg-stone-100 transition-colors"
              >
                Contact & Commission Form
              </button>
            </nav>

            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2.5">
              {isArtistMode ? (
                <button
                  onClick={() => {
                    setGalleryViewMode('upload');
                    scrollToSection('gallery');
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold text-[#270C0C] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-md shadow-sm"
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>+ Upload Work Pictures</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMessage('Master Artist & Sthapati Access');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#3B1414] bg-white border border-stone-300 rounded-md shadow-xs"
                >
                  <i className="fa-solid fa-lock text-stone-500"></i>
                  <span>Artist Login (Thorlakonda Guravaiah)</span>
                </button>
              )}
              <a
                href="tel:+919704926504"
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#3B1414] border border-[#D4AF37] rounded-md bg-[#FAF4DE]"
              >
                <i className="fa-solid fa-phone text-[#C85A17]"></i>
                <span>Call +91 9704926504</span>
              </a>
              <a
                href={ARTIST_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-md shadow-sm"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i>
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-[#270C0C] text-white">
        {/* Background Image Overlay with Sacred Temple Ambience */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity transform scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1920&q=80')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#270C0C] via-[#270C0C]/90 to-[#3B1414]/80"></div>

        {/* Decorative Golden Mandala / Arc Accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[#D4AF37]/20 pointer-events-none"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full border border-[#D4AF37]/15 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#D4AF37] mb-4">
            <span className="w-8 h-px bg-[#D4AF37]"></span>
            <span>Traditional Sacred Craftsmanship · Shilpa Shastra</span>
            <span className="w-8 h-px bg-[#D4AF37]"></span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl text-white">
            Preserving Sacred Traditions Through Divine Art & Temple Architecture
          </h1>

          <div className="mt-4 flex items-center gap-2 text-sm sm:text-base text-[#FAF4DE]/90 font-medium">
            <span className="text-[#D4AF37]">●</span>
            <span>Master Artist:</span>
            <strong className="text-[#D4AF37] tracking-wide font-serif">THORLAKONDA GURAVAIAH</strong>
          </div>

          <p className="mt-6 text-base sm:text-lg text-stone-200 max-w-2xl leading-relaxed">
            Specializing in consecrated temple sculptures, Dravidian and Nagara Vimana/Gopuram architecture, sanctum wall murals with pure 24K gold foil, and bespoke devotional fine art aligned with ancient Vastu Shastra principles.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => {
                setGalleryViewMode('gallery');
                scrollToSection('gallery');
              }}
              className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#e0be48] hover:to-[#c99411] text-[#270C0C] font-bold text-sm sm:text-base rounded-md shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2.5"
            >
              <i className="fa-solid fa-images"></i>
              <span>Explore Arts Work</span>
            </button>
            <button
              onClick={handleOpenUpload}
              className="px-6 py-3.5 bg-[#FAF4DE]/15 hover:bg-[#FAF4DE]/25 text-[#FAF4DE] font-semibold text-sm sm:text-base border border-[#D4AF37] rounded-md transition-all cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <i className="fa-solid fa-cloud-arrow-up text-[#D4AF37]"></i>
              <span>+ Upload Work Pictures</span>
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-stone-500 rounded-md transition-all cursor-pointer flex items-center gap-2.5"
            >
              <i className="fa-solid fa-envelope-open-text text-[#D4AF37]"></i>
              <span>Commission Inquiries</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 pt-8 border-t border-white/15 w-full grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#D4AF37]">25+</div>
              <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider">Years of Mastery</div>
            </div>
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#D4AF37]">150+</div>
              <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider">Temples Sanctified</div>
            </div>
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#D4AF37]">100%</div>
              <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider">Agama Shastra Compliant</div>
            </div>
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#D4AF37]">24K</div>
              <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider">Gold Leaf Murals</div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Artist Section */}
      <section id="about" className="py-20 sm:py-24 bg-[#F8F3E6] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual / Portrait Column */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => {
                  if (isArtistMode) {
                    setIsArtistPhotoModalOpen(true);
                  } else {
                    setAuthModalMessage('Master Artist Verification: Only Thorlakonda Guravaiah can change the Master Artist portrait. Please enter your passcode.');
                    setIsAuthModalOpen(true);
                  }
                }}
                className={`relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(212,175,55,0.35),0_15px_30px_-10px_rgba(42,8,8,0.45)] border-4 border-[#D4AF37] ring-4 ring-[#8B2500]/25 group transition-all duration-300 hover:shadow-[0_30px_70px_-10px_rgba(212,175,55,0.55)] hover:-translate-y-1 ${
                  isArtistMode ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={isArtistMode ? 'Click to replace or upload real artist photo' : 'Master Artist Thorlakonda Guravaiah'}
              >
                {/* Traditional Temple Corner Brass Ornaments */}
                <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#D4AF37] z-20 pointer-events-none opacity-85"></div>
                <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-[#D4AF37] z-20 pointer-events-none opacity-85"></div>
                <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-[#D4AF37] z-20 pointer-events-none opacity-85"></div>
                <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-[#D4AF37] z-20 pointer-events-none opacity-85"></div>

                {/* Top Auspicious Badge */}
                <div className="absolute top-3.5 left-3.5 z-20 px-2.5 py-1 bg-[#270C0C]/85 backdrop-blur-sm rounded-full border border-[#D4AF37]/70 text-[#D4AF37] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                  <i className="fa-solid fa-om text-xs text-[#D4AF37]"></i>
                  <span>Master Sthapati</span>
                </div>

                {/* Direct Replace Photo Action Button (Artist Only) */}
                {isArtistMode ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsArtistPhotoModalOpen(true);
                    }}
                    className="absolute top-3.5 right-3.5 z-30 px-3 py-1.5 bg-[#3B1414]/90 hover:bg-[#2A0808] text-[#D4AF37] hover:text-white text-xs font-semibold rounded-full border border-[#D4AF37] shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Replace artist photo or upload your picture"
                  >
                    <i className="fa-solid fa-camera"></i>
                    <span>Replace Photo</span>
                  </button>
                ) : (
                  <div className="absolute top-3.5 right-3.5 z-30 px-2.5 py-1 bg-[#270C0C]/80 backdrop-blur-sm rounded-full border border-[#D4AF37]/50 text-[#FAF4DE] text-[10px] font-medium flex items-center gap-1 shadow-md">
                    <i className="fa-solid fa-certificate text-[#D4AF37]"></i>
                    <span>Chief Sthapati</span>
                  </div>
                )}

                {/* Main Artist Portrait Image or Handcrafted Devotional Art */}
                <MasterSculptorArtwork
                  customImageUrl={artistPortrait}
                  className="w-full h-[490px]"
                />

                {/* Hover Quick Overlay Hint (Artist Only) */}
                {isArtistMode && (
                  <div className="absolute inset-0 bg-[#270C0C]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-[#2A0808]/90 text-[#D4AF37] px-4 py-2 rounded-full border border-[#D4AF37] text-xs font-bold tracking-wide shadow-xl flex items-center gap-2">
                      <i className="fa-solid fa-camera"></i>
                      <span>Click to Replace / Upload Artist Photo</span>
                    </div>
                  </div>
                )}

                {/* Bottom Artist Name & Attribution Banner */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F0707] via-[#2A0808]/75 to-transparent flex flex-col justify-end p-6 text-white pointer-events-none">
                  <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold flex items-center gap-2">
                    <span className="w-4 h-px bg-[#D4AF37]"></span>
                    <span>Chief Temple Sculptor</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white mt-1 tracking-wide">
                    THORLAKONDA GURAVAIAH
                  </h3>
                  <p className="text-xs text-amber-100/90 mt-0.5">
                    Founder & Sthapati, Sree Guru Arts
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-stone-300">
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                      25+ Years Experience
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10">
                      150+ Temples
                    </span>
                    {isArtistMode && (
                      <span className="text-[#D4AF37] pointer-events-auto ml-auto font-medium flex items-center gap-1 hover:underline">
                        <span>Edit Photo</span>
                        <i className="fa-solid fa-pen-to-square text-[9px]"></i>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Devotional Seal Badge */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#3B1414] text-[#D4AF37] p-4 rounded-lg shadow-xl border border-[#D4AF37] max-w-[210px] hidden sm:block">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-om text-xl text-[#C85A17]"></i>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white">
                    Vastu Aligned
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                  Strict iconometry in accordance with Kashyapa Shilpa Shastra.
                </p>
              </div>
            </div>

            {/* Biography & Philosophy Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A17] mb-3">
                <span className="w-6 h-px bg-[#C85A17]"></span>
                <span>The Sacred Journey</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3B1414] leading-tight">
                Devotion Embodied in Stone, Gold Leaf & Sacred Architecture
              </h2>

              <p className="mt-5 text-stone-700 leading-relaxed text-base">
                With a lifelong dedication to traditional Hindu sacred art, <strong className="text-[#3B1414]">THORLAKONDA GURAVAIAH</strong> has emerged as one of the distinguished master artists and temple architects of southern India. Carrying forward centuries-old shastric knowledge, his work bridges timeless architectural Agamas with modern structural longevity.
              </p>

              <p className="mt-4 text-stone-700 leading-relaxed text-base">
                At <strong className="text-[#3B1414]">Sree Guru Arts</strong>, each commission begins not merely as a design, but as a sacred offering (Seva). From calculating the precise Tala-mana (proportional ratios) for stone sanctum deities to designing majestic multi-tiered Gopurams that orient cosmic prana, Guravaiah garu oversees every chisel stroke and pigment layer personally.
              </p>

              {/* Key Pillars */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-white border border-[#D4AF37]/30 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-sm">
                      <i className="fa-solid fa-ruler-combined"></i>
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-[#3B1414]">
                      Shilpa Shastra Precision
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-normal">
                    Adherence to canonical proportions for mudras, postures, weapons, and facial expressions (Bhava).
                  </p>
                </div>

                <div className="p-4 rounded-md bg-white border border-[#D4AF37]/30 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-sm">
                      <i className="fa-solid fa-leaf"></i>
                    </div>
                    <h4 className="font-heading font-semibold text-sm text-[#3B1414]">
                      Pure & Consecrated Materials
                    </h4>
                  </div>
                  <p className="text-xs text-stone-600 mt-2 leading-normal">
                    Authentic Krishna Shila, teakwood, 24K gold leaf, and enduring mineral pigments resistant to climatic elements.
                  </p>
                </div>
              </div>

              {/* Direct Artist Consultation CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => scrollToSection('contact')}
                  className="px-5 py-2.5 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-sm font-semibold rounded-md shadow transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-handshake"></i>
                  <span>Schedule Consultation</span>
                </button>
                <a
                  href={ARTIST_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-md shadow transition-colors flex items-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>Direct WhatsApp with Artist</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section id="services" className="py-20 sm:py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A17] mb-2">
              <span className="w-6 h-px bg-[#C85A17]"></span>
              <span>Our Sacred Offerings</span>
              <span className="w-6 h-px bg-[#C85A17]"></span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3B1414]">
              Comprehensive Temple & Fine Art Services
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Providing holistic artistry from foundational temple architecture and sanctum idol sculpting to ornate gold leaf murals and private devotional commissions.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {CORE_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg p-7 border border-stone-200 hover:border-[#D4AF37] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-xl group-hover:bg-[#C85A17] group-hover:text-white transition-colors">
                      <i className={service.iconClass}></i>
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#3B1414] group-hover:text-[#C85A17] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-[#C85A17] font-medium mt-0.5">
                        {service.shortDesc}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-stone-700 text-sm leading-relaxed">
                    {service.fullDesc}
                  </p>

                  <div className="mt-5 pt-4 border-t border-stone-100">
                    <div className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-2">
                      Key Highlights:
                    </div>
                    <ul className="space-y-1.5">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                          <i className="fa-solid fa-check text-[#D4AF37] mt-0.5"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, service: service.title }));
                      scrollToSection('contact');
                    }}
                    className="text-xs font-semibold text-[#3B1414] hover:text-[#C85A17] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Request Quotation</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>

                  <a
                    href={generateWhatsAppLink(ARTIST_INFO.phoneClean, {
                      service: service.title,
                      message: `Inquiry regarding ${service.title} services.`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Shilpa Shastra & Project Estimator */}
          <div className="mt-16 bg-[#F8F3E6] rounded-xl p-6 sm:p-8 border border-[#D4AF37]/50 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C85A17]">
                    <i className="fa-solid fa-compass"></i>
                    <span>Temple Trust & Devotee Planning Tool</span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#3B1414] mt-1">
                    Shilpa Shastra Project & Material Guide
                  </h3>
                </div>
                <span className="text-xs text-stone-500 italic">
                  Quick estimate for temple planning
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    Select Project Scope:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'temple-sculptures', label: 'Temple Sculptures & Idols' },
                      { id: 'gopuram-vimana', label: 'Gopuram & Vimana Tower' },
                      { id: 'temple-murals', label: 'Gold Leaf Murals' },
                      { id: 'custom-commissions', label: 'Private Mandir Art' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setEstimatorService(s.id)}
                        className={`text-left p-2.5 text-xs rounded-md border transition-all cursor-pointer ${
                          estimatorService === s.id
                            ? 'bg-[#3B1414] text-white border-[#3B1414] font-medium shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-[#D4AF37]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mt-4 mb-2">
                    Project Scale:
                  </label>
                  <div className="flex gap-2">
                    {(['small', 'medium', 'monumental'] as const).map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => setEstimatorScale(scale)}
                        className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md border font-medium transition-all cursor-pointer ${
                          estimatorScale === scale
                            ? 'bg-[#D4AF37] text-[#270C0C] border-[#D4AF37] font-bold shadow-sm'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-[#D4AF37]'
                        }`}
                      >
                        {scale === 'small' ? 'Residential' : scale === 'medium' ? 'Standard Temple' : 'Monumental Temple'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimate Output Card */}
                <div className="bg-white p-5 rounded-lg border border-stone-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Estimated Timeline:</span>
                      <span className="font-heading font-bold text-base text-[#C85A17]">
                        {currentEstimate.estimatedWeeks}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="text-xs font-semibold text-stone-700 mb-1">
                        Shastra & Vastu Recommendation:
                      </div>
                      <p className="text-xs text-stone-600 italic leading-relaxed">
                        "{currentEstimate.shastraAspect}"
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="text-xs font-semibold text-stone-700 mb-1.5">
                        Authentic Materials Required:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentEstimate.keyMaterials.map((mat, i) => (
                          <span
                            key={i}
                            className="text-[11px] bg-[#FAF4DE] text-[#3B1414] px-2 py-0.5 rounded border border-[#D4AF37]/30"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => {
                        const serviceObj = CORE_SERVICES.find((s) => s.id === estimatorService);
                        const serviceTitle = serviceObj ? serviceObj.title : 'Temple Art';
                        setFormData((prev) => ({
                          ...prev,
                          service: serviceTitle,
                          message: `Inquiring about ${estimatorScale} scale project for ${serviceTitle}. (Estimated timeline: ${currentEstimate.estimatedWeeks})`,
                        }));
                        scrollToSection('contact');
                      }}
                      className="w-full py-2 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-file-signature"></i>
                      <span>Send This Specification to Artist</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arts Work Showcase & Upload Section */}
      <section id="gallery" className="py-20 sm:py-24 bg-[#F8F3E6] border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with View Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-stone-300">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A17] mb-2">
                <span className="w-6 h-px bg-[#C85A17]"></span>
                <span>Sacred Temple Sculptures & Architecture · Thorlakonda Guravaiah</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3B1414]">
                Arts Work
              </h2>
              <p className="mt-2 text-stone-600 text-sm max-w-2xl leading-relaxed">
                Visual showcase of consecrated stone deities, Dravidian Vimana architecture, and sacred temple art creations by master artist Thorlakonda Guravaiah.
              </p>
            </div>

            {/* View Switcher: Browse Arts Work vs Upload Studio */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex p-1.5 bg-white/80 backdrop-blur-xs rounded-lg border border-stone-300 shadow-xs">
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('gallery')}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                    galleryViewMode === 'gallery'
                      ? 'bg-[#3B1414] text-[#FAF4DE] shadow-sm'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <i className="fa-solid fa-images text-xs"></i>
                  <span>Arts Work ({portfolioItems.length} Pictures)</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenUpload}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
                    galleryViewMode === 'upload'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#270C0C] shadow-sm'
                      : 'text-stone-700 hover:text-[#C85A17] hover:bg-stone-100'
                  }`}
                >
                  <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                  <span>Upload Work Picture</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional View: Upload Studio Mode */}
          {galleryViewMode === 'upload' ? (
            <div className="mt-8 animate-fadeIn">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('gallery')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#3B1414] hover:text-[#C85A17] cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>&larr; Return to Arts Work Pictures</span>
                </button>
                <span className="text-xs text-stone-500 italic">
                  Upload high-res picture of your temple artwork
                </span>
              </div>

              <UploadWorkStudio
                onPublish={handlePublishFromStudio}
                onCancel={() => setGalleryViewMode('gallery')}
              />
            </div>
          ) : (
            /* Gallery Mode: Search, Category Filters, and Artwork Grid */
            <div className="mt-8">
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-300 pb-4">
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'All Works' },
                    { id: 'sculptures', label: 'Deity Sculptures & Idols' },
                    { id: 'murals', label: 'Sacred Murals & Gold Leaf' },
                    { id: 'temple-art', label: 'Temple Art & Gopurams' },
                    { id: 'general', label: 'Custom Fine Art' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-[#3B1414] text-[#FAF4DE] shadow-sm'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search & Action Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-full sm:w-64 relative">
                    <input
                      type="text"
                      placeholder="Search deities, stone, murals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-1.5 text-xs bg-white rounded-md border border-stone-300 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                      aria-label="Search portfolio artworks"
                    />
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-stone-400 text-xs"></i>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
                        aria-label="Clear search"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleOpenUpload}
                    className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-[#270C0C] text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    title="Upload artwork picture"
                  >
                    <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                    <span>+ Upload Picture</span>
                  </button>

                  {isArtistMode && portfolioItems.length > 0 && (
                    <button
                      onClick={handleResetPortfolio}
                      className="px-2.5 py-1.5 text-stone-500 hover:text-red-600 hover:bg-white text-xs rounded border border-transparent hover:border-stone-200 transition-colors cursor-pointer"
                      title="Clear all pictures"
                    >
                      <i className="fa-solid fa-trash-can mr-1 text-[10px]"></i>
                      <span>Clear All</span>
                    </button>
                  )}

                  <span className="text-xs text-stone-500 pl-2 border-l border-stone-300 hidden lg:inline">
                    {filteredItems.length} of {portfolioItems.length} pictures
                  </span>
                </div>
              </div>

              {/* Arts Work Pictures Grid or Tailored Empty State */}
              {portfolioItems.length === 0 ? (
                /* Completely Empty State: All AI artworks deleted */
                isArtistMode ? (
                  /* Master Artist View: Exclusive Upload Callout */
                  <div className="text-center py-16 px-6 bg-gradient-to-b from-white via-white to-[#FAF4DE]/50 rounded-2xl border-2 border-dashed border-[#D4AF37] mt-8 shadow-sm animate-fadeIn">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-3xl mb-4 border-2 border-[#D4AF37] shadow-sm">
                      <i className="fa-solid fa-paintbrush"></i>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3B1414] text-[#FAF4DE] text-xs font-bold rounded-full mb-3 shadow-xs">
                      <i className="fa-solid fa-shield-halved text-[#D4AF37]"></i>
                      <span>Master Artist Mode · Thorlakonda Guravaiah</span>
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#3B1414]">
                      Your Arts Work Gallery Is Ready
                    </h3>
                    <p className="text-sm text-stone-600 max-w-xl mx-auto mt-2 leading-relaxed">
                      All sample artworks have been deleted. You have exclusive private permission to upload your own authentic temple work pictures. Public visitors cannot upload or modify your works.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
                      <button
                        onClick={handleOpenUpload}
                        className="px-7 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#e0be48] hover:to-[#c99411] text-[#270C0C] text-sm font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-base"></i>
                        <span>Upload Your Work Pictures</span>
                      </button>
                      <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="px-5 py-3.5 bg-white text-stone-700 hover:text-[#3B1414] text-xs font-semibold rounded-lg border border-stone-300 hover:border-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <i className="fa-solid fa-gear text-[#C85A17]"></i>
                        <span>Passcode & Studio Settings</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Public / Visitor View: Restricted upload notice */
                  <div className="text-center py-16 px-6 bg-white rounded-2xl border border-stone-200 mt-8 shadow-xs animate-fadeIn">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-3xl mb-4 border border-[#D4AF37]/50 shadow-sm">
                      <i className="fa-solid fa-images text-[#D4AF37]"></i>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF4DE] text-[#3B1414] text-xs font-semibold rounded-full mb-3 border border-[#D4AF37]/40">
                      <i className="fa-solid fa-lock text-[#C85A17]"></i>
                      <span>Artist Upload Portal · Restricted for Thorlakonda Guravaiah Only</span>
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[#3B1414]">
                      Arts Work Showcase
                    </h3>
                    <p className="text-sm text-stone-600 max-w-lg mx-auto mt-2 leading-relaxed">
                      Master artist Thorlakonda Guravaiah is curating and uploading pictures of his consecrated temple sculptures, murals, and architectural works. Public uploads are strictly restricted to protect artistic authenticity.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setAuthModalMessage('Master Artist Verification: Only Thorlakonda Guravaiah can upload work pictures. Please enter your artist passcode.');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-6 py-3.5 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fa-solid fa-lock text-[#D4AF37]"></i>
                        <span>Artist Login (Thorlakonda Guravaiah)</span>
                      </button>
                      <a
                        href={ARTIST_INFO.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center gap-2"
                      >
                        <i className="fa-brands fa-whatsapp text-sm"></i>
                        <span>Inquire on WhatsApp</span>
                      </a>
                      <a
                        href="tel:+919704926504"
                        className="px-4 py-3.5 bg-white text-[#3B1414] border border-[#D4AF37] hover:bg-[#FAF4DE] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-phone text-[#C85A17]"></i>
                        <span>Call +91 9704926504</span>
                      </a>
                    </div>
                  </div>
                )
              ) : filteredItems.length === 0 ? (
                /* Search Filter Empty State when items exist but filter returned 0 */
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-stone-300 mt-8 shadow-xs">
                  <i className="fa-solid fa-images text-stone-300 text-4xl mb-3"></i>
                  <h4 className="font-heading font-semibold text-stone-700 text-base">
                    No pictures found matching your filter
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Try clearing your search query or upload a new work picture.
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setActiveCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-[#3B1414] text-[#FAF4DE] text-xs font-semibold rounded cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    {isArtistMode && (
                      <button
                        onClick={handleOpenUpload}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#270C0C] text-xs font-bold rounded cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                        <span>Upload Your Work Picture</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm hover:shadow-2xl group cursor-pointer flex flex-col relative ${
                        recentlyAddedId === item.id
                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md'
                          : 'border-stone-200 hover:border-[#D4AF37]'
                      }`}
                      tabIndex={0}
                      role="button"
                      aria-label={`View picture of ${item.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedItem(item);
                        }
                      }}
                    >
                      {/* Work Picture Container */}
                      <div className="relative aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-stone-900">
                        <img
                          src={item.image || item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />

                        {/* Subtle Vignette Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity"></div>

                        {/* Category & New Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                          <span className="bg-[#270C0C]/85 backdrop-blur-xs text-[#FAF4DE] text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#D4AF37]/40 shadow-sm">
                            {item.categoryLabel}
                          </span>
                          {recentlyAddedId === item.id && (
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                              <i className="fa-solid fa-sparkles text-[9px]"></i>
                              <span>NEW PICTURE</span>
                            </span>
                          )}
                        </div>

                        {/* Artist-Only Action Buttons (Edit / Delete) */}
                        {isArtistMode && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditorItem(item);
                                setIsNewArtwork(false);
                                setIsEditorOpen(true);
                              }}
                              className="bg-white/95 hover:bg-[#FAF4DE] text-[#3B1414] hover:text-[#C85A17] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md border border-stone-200 transition-all flex items-center gap-1 cursor-pointer"
                              title="Edit work picture"
                              aria-label={`Edit ${item.title}`}
                            >
                              <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDelete(item);
                              }}
                              className="bg-white/95 hover:bg-red-50 text-stone-600 hover:text-red-600 text-[11px] font-bold w-7 h-7 rounded-md shadow-md border border-stone-200 transition-all flex items-center justify-center cursor-pointer"
                              title="Delete picture"
                              aria-label={`Delete ${item.title}`}
                            >
                              <i className="fa-solid fa-trash-can text-[10px]"></i>
                            </button>
                          </div>
                        )}

                        {/* Picture Title & Quick Action Caption Bar (No description text per user request) */}
                        <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug drop-shadow-sm truncate">
                              {item.title}
                            </h3>
                            <p className="text-xs text-amber-200/90 italic truncate mt-0.5 font-serif">
                              {item.medium}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm group-hover:bg-[#D4AF37] group-hover:text-[#270C0C] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all shadow-sm">
                            <i className="fa-solid fa-maximize text-[10px]"></i>
                            <span className="hidden sm:inline">View</span>
                          </div>
                        </div>
                      </div>

                      {/* Pure Picture Card Quick WhatsApp Inquire Bar */}
                      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
                        <a
                          href={generateWhatsAppLink(ARTIST_INFO.phoneClean, {
                            service: item.categoryLabel,
                            message: `Namaste Guravaiah garu, I am inquiring about your artwork picture: "${item.title}".`,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1.5 text-[11px]"
                          title="Inquire about this picture on WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp text-sm text-emerald-600"></i>
                          <span>Inquire on WhatsApp</span>
                        </a>

                        <span className="text-[#C85A17] font-semibold flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                          <span>Full Picture</span>
                          <i className="fa-solid fa-arrow-right text-[9px]"></i>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Picture Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#1A0A0A] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border-2 border-[#D4AF37] relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/70 text-white hover:bg-[#3B1414] hover:text-[#D4AF37] transition-colors flex items-center justify-center cursor-pointer shadow-md"
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* High-Resolution Picture View */}
            <div className="md:w-3/5 bg-black flex items-center justify-center p-3 relative min-h-[350px]">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="max-h-[78vh] w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Picture Details & Actions (Clean, no long text descriptions) */}
            <div className="md:w-2/5 p-6 bg-[#270C0C] text-[#FAF4DE] flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#D4AF37]/40">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                  {selectedItem.categoryLabel}
                </div>
                <h3 id="modal-title" className="font-heading text-2xl font-bold text-white leading-tight">
                  {selectedItem.title}
                </h3>

                <div className="mt-4 space-y-2 text-xs border-y border-[#D4AF37]/30 py-3 text-stone-300">
                  <div className="flex justify-between">
                    <span className="text-[#D4AF37]">Medium / Material:</span>
                    <span className="font-medium text-white text-right">{selectedItem.medium}</span>
                  </div>
                  {selectedItem.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-[#D4AF37]">Scale / Dimensions:</span>
                      <span className="font-medium text-white">{selectedItem.dimensions}</span>
                    </div>
                  )}
                  {selectedItem.locationOrTrust && (
                    <div className="flex justify-between">
                      <span className="text-[#D4AF37]">Temple / Project:</span>
                      <span className="font-medium text-white">{selectedItem.locationOrTrust}</span>
                    </div>
                  )}
                </div>

                {/* Artist Notice */}
                <p className="mt-4 text-xs text-stone-300 leading-relaxed italic">
                  Masterwork picture by Sri Thorlakonda Guravaiah · Sree Guru Arts.
                </p>
              </div>

              {/* Inquiry & Artist Controls */}
              <div className="mt-6 pt-4 border-t border-[#D4AF37]/30 flex flex-col gap-2.5">
                {isArtistMode && (
                  <div className="p-3 bg-[#3B1414] rounded-lg border border-[#D4AF37]/50 space-y-2 mb-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-user-shield text-[#C85A17]"></i>
                        <span>Artist Controls</span>
                      </span>
                      <span className="text-emerald-400 font-semibold text-[10px]">Authorized</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditorItem(selectedItem);
                          setIsNewArtwork(false);
                          setIsEditorOpen(true);
                        }}
                        className="py-2 px-3 bg-white/10 hover:bg-white/20 text-[#FAF4DE] text-xs font-semibold rounded border border-[#D4AF37]/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <i className="fa-solid fa-pen-to-square text-[#D4AF37]"></i>
                        <span>Edit Picture</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleRequestDelete(selectedItem);
                        }}
                        className="py-2 px-3 bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-semibold rounded border border-red-500/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <i className="fa-solid fa-trash-can text-red-400"></i>
                        <span>Delete Picture</span>
                      </button>
                    </div>
                  </div>
                )}

                <a
                  href={generateWhatsAppLink(ARTIST_INFO.phoneClean, {
                    service: selectedItem.categoryLabel,
                    message: `Namaste Thorlakonda Guravaiah garu, I am inquiring about your artwork picture: "${selectedItem.title}".`,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i>
                  <span>Inquire About This Work on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      service: selectedItem.categoryLabel,
                      message: `Inquiry regarding artwork picture: "${selectedItem.title}". Requesting consultation with Thorlakonda Guravaiah.`,
                    }));
                    setSelectedItem(null);
                    scrollToSection('contact');
                  }}
                  className="w-full py-2.5 bg-[#3B1414] hover:bg-[#1C0808] text-[#FAF4DE] text-xs font-semibold rounded-md border border-[#D4AF37]/40 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-file-pen"></i>
                  <span>Fill Commission Inquiry Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Sree Guru Arts */}
      <section id="why-us" className="py-20 sm:py-24 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A17] mb-2">
              <span className="w-6 h-px bg-[#C85A17]"></span>
              <span>The Sree Guru Arts Difference</span>
              <span className="w-6 h-px bg-[#C85A17]"></span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3B1414]">
              Why Temple Trusts & Devotees Entrust Us
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Temple construction and deity sculpting are sacred responsibilities requiring ritual purity, unyielding adherence to Agamic canons, and flawless craftsmanship.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {TRUST_POINTS.map((point, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-stone-200 hover:border-[#D4AF37] transition-all shadow-sm hover:shadow-md flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-[#FAF4DE] text-[#C85A17] flex items-center justify-center text-xl mb-5">
                  <i className={point.iconClass}></i>
                </div>
                <h3 className="font-heading text-lg font-bold text-[#3B1414] mb-2 leading-snug">
                  {point.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed flex-1">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Trust Banner Callout */}
          <div className="mt-14 bg-gradient-to-r from-[#3B1414] via-[#270C0C] to-[#3B1414] text-white rounded-xl p-8 shadow-xl border border-[#D4AF37]/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-2xl shrink-0">
                <i className="fa-solid fa-certificate"></i>
              </div>
              <div>
                <h4 className="font-heading text-xl font-bold text-[#FAF4DE]">
                  Authentic Shilpa Shastra Certification
                </h4>
                <p className="text-xs text-stone-300 mt-1 max-w-xl">
                  Every presiding deity idol and temple sanctum architecture is validated according to Tala-mana measurements for peaceful Agamic consecration (Kumbhabhishekam).
                </p>
              </div>
            </div>
            <a
              href="tel:+919704926504"
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#B8860B] text-[#270C0C] text-xs font-bold uppercase tracking-wider rounded-md shadow transition-colors whitespace-nowrap"
            >
              Direct Call with Artist
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Inquiry Section */}
      <section id="contact" className="py-20 sm:py-24 bg-[#F8F3E6] border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#C85A17] mb-2">
              <span className="w-6 h-px bg-[#C85A17]"></span>
              <span>Commission Inquiries & Consultations</span>
              <span className="w-6 h-px bg-[#C85A17]"></span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#3B1414]">
              Connect with Master Artist THORLAKONDA GURAVAIAH
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              Whether you are undertaking temple construction, commissioning sanctum idols, or seeking custom devotional gold leaf art for your home, we invite you to discuss your vision.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Direct Contact Cards Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* Artist Card */}
              <div className="bg-white rounded-lg p-6 border border-stone-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#FAF4DE] text-[#C85A17] border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-serif font-bold">
                    TG
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#3B1414]">
                      THORLAKONDA GURAVAIAH
                    </h3>
                    <p className="text-xs text-[#C85A17] font-medium">
                      Master Temple Sculptor & Founder
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Sree Guru Arts
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-stone-100 text-[#C85A17] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Direct Phone</div>
                      <a
                        href="tel:+919704926504"
                        className="font-medium text-stone-900 hover:text-[#C85A17] transition-colors"
                      >
                        +91 9704926504
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-stone-100 text-[#C85A17] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-envelope"></i>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Official Email</div>
                      <a
                        href="mailto:sreeguruarts@gmail.com"
                        className="font-medium text-stone-900 hover:text-[#C85A17] transition-colors break-all"
                      >
                        sreeguruarts@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-stone-100 text-[#C85A17] flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                    <div>
                      <div className="text-stone-500 text-[10px] uppercase font-semibold">Service Coverage</div>
                      <span className="font-medium text-stone-900">
                        Andhra Pradesh, Telangana & Pan-India Commissions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout Card */}
              <div className="bg-[#FAF4DE] rounded-lg p-6 border border-[#D4AF37] shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <i className="fa-brands fa-whatsapp text-2xl text-emerald-600"></i>
                  <h4 className="font-heading font-bold text-[#3B1414] text-base">
                    Instant WhatsApp Consultation
                  </h4>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Send your temple architectural blueprints, sanctum measurements, or deity reference photos directly to Thorlakonda Guravaiah garu on WhatsApp for quick review.
                </p>
                <a
                  href={ARTIST_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-base"></i>
                  <span>Message on WhatsApp (+91 9704926504)</span>
                </a>
              </div>

              {/* Consultation Assurance */}
              <div className="bg-white rounded-lg p-5 border border-stone-200 text-xs text-stone-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#3B1414]">
                  <i className="fa-solid fa-shield-halved text-[#D4AF37]"></i>
                  <span>Commitment to Devotees & Trusts:</span>
                </div>
                <p>
                  • Strict adherence to temple trust project confidentiality.<br />
                  • Transparent phase-wise milestone updates with photography.<br />
                  • Direct phone access to master artist throughout the sculpting process.
                </p>
              </div>
            </div>

            {/* Inquiry Form Column */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-lg p-6 sm:p-8 border border-stone-200 shadow-sm relative">
                {formSubmitted ? (
                  <div className="text-center py-8 animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl mb-4 border-2 border-emerald-500">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-[#3B1414]">
                      Inquiry Received with Gratitude!
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto">
                      Namaste <strong>{formData.name}</strong>. Your inquiry for <strong>{formData.service}</strong> has been logged. Master artist THORLAKONDA GURAVAIAH will review your project details and contact you at <strong>{formData.phone}</strong> shortly.
                    </p>

                    {/* Secondary WhatsApp Direct Action */}
                    <div className="mt-6 pt-6 border-t border-stone-200 max-w-md mx-auto flex flex-col gap-3">
                      <a
                        href={generateWhatsAppLink(ARTIST_INFO.phoneClean, {
                          name: formData.name,
                          service: formData.service,
                          message: formData.message,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow flex items-center justify-center gap-2"
                      >
                        <i className="fa-brands fa-whatsapp text-base"></i>
                        <span>Forward This Inquiry Directly to WhatsApp</span>
                      </a>

                      <a
                        href={generateEmailLink(ARTIST_INFO.email, {
                          name: formData.name,
                          phone: formData.phone,
                          service: formData.service,
                          message: formData.message,
                        })}
                        className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-md flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-envelope"></i>
                        <span>Send via Email Client</span>
                      </a>

                      <button
                        onClick={handleResetForm}
                        className="mt-2 text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                      >
                        Submit another commission inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitInquiry} noValidate>
                    <div className="border-b border-stone-200 pb-4 mb-6">
                      <h3 className="font-heading text-xl font-bold text-[#3B1414]">
                        Commission Inquiry & Consultation Form
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Please fill in the project specifications below. All fields marked with * are required.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Name Field */}
                      <div id="field-name">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Full Name or Temple Trust Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g. Srikanth Reddy / Sri Lakshmi Devasthanam"
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border ${
                            formErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300 focus:border-[#D4AF37]'
                          } focus:outline-none`}
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{formErrors.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Phone & Email Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div id="field-phone">
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Phone / Mobile Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. +91 9704926504"
                            className={`w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border ${
                              formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300 focus:border-[#D4AF37]'
                            } focus:outline-none`}
                          />
                          {formErrors.phone && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span>{formErrors.phone}</span>
                            </p>
                          )}
                        </div>

                        <div id="field-email">
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. trust@temple.org"
                            className={`w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border ${
                              formErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300 focus:border-[#D4AF37]'
                            } focus:outline-none`}
                          />
                          {formErrors.email && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                              <i className="fa-solid fa-circle-exclamation"></i>
                              <span>{formErrors.email}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Service Required Dropdown */}
                      <div id="field-service">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Service Required *
                        </label>
                        <select
                          name="service"
                          value={formData.service}
                          onChange={handleInputChange}
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border ${
                            formErrors.service ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300 focus:border-[#D4AF37]'
                          } focus:outline-none`}
                        >
                          <option value="Temple Sculptures & Murals">Temple Sculptures & Murals (Stone/Cement/Plaster)</option>
                          <option value="Temple Interior & Vimana/Gopuram Artwork">Temple Interior & Vimana/Gopuram Artwork</option>
                          <option value="Custom Deities & Sacred Wall Murals">Custom Deities, Sacred Wall Murals & 24K Gold Leaf</option>
                          <option value="General Custom Fine Art & Decorative Commissions">General Custom Fine Art & Decorative Commissions</option>
                          <option value="Vastu & Architectural Temple Consultation">Vastu & Architectural Temple Consultation</option>
                        </select>
                        {formErrors.service && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{formErrors.service}</span>
                          </p>
                        )}
                      </div>

                      {/* Temple Location / Project Site */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Temple / Project Location (City & State)
                        </label>
                        <input
                          type="text"
                          name="templeOrProjectLocation"
                          value={formData.templeOrProjectLocation}
                          onChange={handleInputChange}
                          placeholder="e.g. Tirupati, Andhra Pradesh / Hyderabad / Overseas"
                          className="w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border border-stone-300 focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      {/* Project Message / Requirements */}
                      <div id="field-message">
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Project Details, Desired Deities or Dimensions *
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Please describe the deity, idol height, temple structure, or specific mural requirements..."
                          className={`w-full px-3.5 py-2.5 text-xs bg-[#FDFBF7] rounded border ${
                            formErrors.message ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300 focus:border-[#D4AF37]'
                          } focus:outline-none`}
                        ></textarea>
                        {formErrors.message && (
                          <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{formErrors.message}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-7 py-3 bg-[#3B1414] hover:bg-[#270C0C] text-[#FAF4DE] text-xs font-bold uppercase tracking-wider rounded-md shadow transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>Submitting Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-paper-plane"></i>
                            <span>Submit Commission Inquiry</span>
                          </>
                        )}
                      </button>

                      <a
                        href={generateWhatsAppLink(ARTIST_INFO.phoneClean, {
                          name: formData.name,
                          service: formData.service,
                          message: formData.message,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fa-brands fa-whatsapp text-sm"></i>
                        <span>Fast Track via WhatsApp</span>
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#270C0C] text-stone-300 border-t border-[#D4AF37]/30 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C85A17] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#270C0C] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-sm">
                    SG
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">
                    Sree Guru Arts
                  </h3>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">
                    Thorlakonda Guravaiah
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-stone-300 max-w-md leading-relaxed">
                Dedicated to sacred temple architecture, classical stone and stucco sculpting, consecrated deity idols, and pure 24K gold foil devotional murals in strict alignment with ancient Shilpa Shastra tradition.
              </p>
              <div className="mt-5 flex items-center gap-3">
                <a
                  href={ARTIST_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
                <a
                  href="tel:+919704926504"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#270C0C] text-white flex items-center justify-center transition-colors"
                  aria-label="Phone"
                >
                  <i className="fa-solid fa-phone"></i>
                </a>
                <a
                  href="mailto:sreeguruarts@gmail.com"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C85A17] text-white flex items-center justify-center transition-colors"
                  aria-label="Email"
                >
                  <i className="fa-solid fa-envelope"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="font-heading text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
                Quick Navigation
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => scrollToSection('home')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    About THORLAKONDA GURAVAIAH
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('services')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Temple & Fine Art Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('gallery')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Arts Work
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('why-us')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Why Choose Sree Guru Arts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                  >
                    Commission Inquiry
                  </button>
                </li>
              </ul>
            </div>

            {/* Direct Contact Details */}
            <div>
              <div className="font-heading text-sm font-semibold text-[#D4AF37] uppercase tracking-wider mb-3">
                Direct Contact
              </div>
              <ul className="space-y-2.5 text-xs text-stone-300">
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-user text-[#D4AF37] mt-0.5"></i>
                  <span>THORLAKONDA GURAVAIAH</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-phone text-[#D4AF37] mt-0.5"></i>
                  <a href="tel:+919704926504" className="hover:text-white transition-colors">
                    +91 9704926504
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-solid fa-envelope text-[#D4AF37] mt-0.5"></i>
                  <a href="mailto:sreeguruarts@gmail.com" className="hover:text-white transition-colors break-all">
                    sreeguruarts@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fa-brands fa-whatsapp text-emerald-400 mt-0.5"></i>
                  <a
                    href={ARTIST_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    wa.me/919704926504
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with Back to Top & Artist Access */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <p>
              © {new Date().getFullYear()} Sree Guru Arts · Master Artist THORLAKONDA GURAVAIAH. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {isArtistMode ? (
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Artist Mode Active (Settings)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMessage('Master Artist & Sthapati Access');
                    setIsAuthModalOpen(true);
                  }}
                  className="text-stone-400 hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  <span>Artist Login (Thorlakonda Guravaiah)</span>
                </button>
              )}
              <span className="hidden sm:inline text-stone-600">|</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-2 rounded bg-white/10 hover:bg-[#D4AF37] hover:text-[#270C0C] text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                aria-label="Scroll back to top"
              >
                <span>Back to Top</span>
                <i className="fa-solid fa-arrow-up text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick Action for Mobile Devices */}
      <div className="md:hidden fixed bottom-3 right-3 z-30 flex items-center gap-2">
        <a
          href="tel:+919704926504"
          className="w-12 h-12 rounded-full bg-[#3B1414] text-[#FAF4DE] shadow-xl border border-[#D4AF37] flex items-center justify-center text-lg"
          aria-label="Call artist now"
        >
          <i className="fa-solid fa-phone"></i>
        </a>
        <a
          href={ARTIST_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center text-2xl hover:bg-emerald-700"
          aria-label="Chat on WhatsApp"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#270C0C] text-[#FAF4DE] border border-[#D4AF37] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 text-xs animate-fadeIn max-w-sm">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Artwork Photo & Description Editor Studio Modal */}
      <ArtworkEditorModal
        item={editorItem}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveArtwork}
        onDelete={handleDeleteArtwork}
        onRequestDelete={handleRequestDelete}
        isNew={isNewArtwork}
      />

      {/* Master Artist Portrait Photo Editor Modal */}
      <ArtistImageEditorModal
        isOpen={isArtistPhotoModalOpen}
        currentImage={artistPortrait}
        onClose={() => setIsArtistPhotoModalOpen(false)}
        onSave={handleSaveArtistPortrait}
        onReset={handleResetArtistPortrait}
      />

      {/* In-App Delete Confirmation Modal (Reliable - Replaces window.confirm) */}
      <DeleteConfirmationModal
        item={itemToDelete}
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingArtwork}
      />

      {/* In-App Reset Portfolio Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmResetPortfolio}
      />

      {/* Master Artist Passcode Auth Modal */}
      <ArtistAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleArtistLoginSuccess}
        titleMessage={authModalMessage}
      />

      {/* Master Artist Settings & Security Modal */}
      <ArtistSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleArtistLogout}
        onRequestResetPortfolio={() => setIsResetConfirmOpen(true)}
        onRequestResetPortrait={handleResetArtistPortrait}
      />
    </div>
  );
}
