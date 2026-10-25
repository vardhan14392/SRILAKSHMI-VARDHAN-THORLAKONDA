/**
 * Core business & portfolio logic for Sree Guru Arts
 * Thorlakonda Guravaiah - Sacred Temple Artwork & Architecture
 */

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'temple-art' | 'murals' | 'sculptures' | 'general';
  categoryLabel: string;
  image: string;
  thumbnail: string;
  description: string;
  medium: string;
  dimensions?: string;
  locationOrTrust?: string;
  tags: string[];
}

export interface InquiryFormData {
  name: string;
  phone: string;
  email?: string;
  service: string;
  templeOrProjectLocation?: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof InquiryFormData, string>>;
}

/**
 * Validates the temple artwork commission inquiry form
 */
export function validateInquiryForm(data: InquiryFormData): FormValidationResult {
  const errors: Partial<Record<keyof InquiryFormData, string>> = {};

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  // Phone validation (accepts Indian format 10 digits or international formats)
  const cleanPhone = (data.phone || '').replace(/[\s\-\(\)\+]/g, '');
  if (!data.phone || data.phone.trim().length === 0) {
    errors.phone = 'Phone number is required for contact.';
  } else if (!/^\d{10,15}$/.test(cleanPhone)) {
    errors.phone = 'Please enter a valid phone number (at least 10 digits).';
  }

  // Email validation (optional but validated if provided)
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
  }

  // Service validation
  if (!data.service || data.service.trim().length === 0 || data.service === 'default') {
    errors.service = 'Please select the service required for your project.';
  }

  // Message validation
  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Please provide project details or dimensions (at least 10 characters).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Filter portfolio items by category and optional search term
 */
export function filterPortfolioItems(
  items: PortfolioItem[],
  selectedCategory: string,
  searchQuery = ''
): PortfolioItem[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    if (!matchesCategory) return false;

    if (!query) return true;

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.medium.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
}

/**
 * Generates direct WhatsApp click-to-chat URL with prefilled devotional inquiry text
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  inquiry?: { name?: string; service?: string; message?: string }
): string {
  // Strip non-numeric characters except leading country code
  const sanitizedNumber = phoneNumber.replace(/[^0-9]/g, '');

  if (!inquiry || (!inquiry.name && !inquiry.service && !inquiry.message)) {
    const defaultText = `Namaste Sri Thorlakonda Guravaiah garu, I am interested in consulting with Sree Guru Arts regarding temple artwork & custom sacred commissions.`;
    return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(defaultText)}`;
  }

  let text = `Namaste Sri Thorlakonda Guravaiah garu,\n\nI would like to inquire about sacred art services from Sree Guru Arts:\n`;
  if (inquiry.name) text += `• Name: ${inquiry.name.trim()}\n`;
  if (inquiry.service) text += `• Service Required: ${inquiry.service}\n`;
  if (inquiry.message) text += `• Project Details: ${inquiry.message.trim()}\n`;
  text += `\nPlease let me know your availability for discussion.`;

  return `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct email link with prefilled subject and body
 */
export function generateEmailLink(
  email: string,
  inquiry?: { name?: string; phone?: string; service?: string; message?: string }
): string {
  const subject = inquiry?.service
    ? `Commission Inquiry: ${inquiry.service} - Sree Guru Arts`
    : 'Commission Inquiry - Sree Guru Arts';

  let body = `Namaste Thorlakonda Guravaiah garu,\n\n`;
  if (inquiry?.name) body += `Name: ${inquiry.name}\n`;
  if (inquiry?.phone) body += `Contact Number: ${inquiry.phone}\n`;
  if (inquiry?.service) body += `Service Required: ${inquiry.service}\n`;
  if (inquiry?.message) body += `\nProject Description & Requirements:\n${inquiry.message}\n`;
  body += `\nLooking forward to your guidance.\nBest regards.`;

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Estimates duration and Shilpa Shastra recommendation based on project type and scope
 */
export function calculateProjectEstimate(
  serviceType: string,
  scale: 'small' | 'medium' | 'monumental'
): { estimatedWeeks: string; shastraAspect: string; keyMaterials: string[] } {
  switch (serviceType) {
    case 'temple-sculptures':
      return {
        estimatedWeeks: scale === 'monumental' ? '12-24 weeks' : scale === 'medium' ? '6-10 weeks' : '3-5 weeks',
        shastraAspect: 'Strict iconometric proportions according to Kashyapa Shilpa Shastra and Vastu Vidya.',
        keyMaterials: ['Krishna Shila (Black Stone)', 'White Marble', 'Reinforced Special Concrete', 'Brass/Panchaloha alloy'],
      };
    case 'temple-murals':
      return {
        estimatedWeeks: scale === 'monumental' ? '8-16 weeks' : scale === 'medium' ? '4-6 weeks' : '2-3 weeks',
        shastraAspect: 'Vibrant Fresco-secco techniques with traditional mineral pigments and 24K gold leaf gilding.',
        keyMaterials: ['Mineral Pigments', 'Pure Gold Leaf', 'Lime Plaster Primer', 'Weatherproof Acrylic Sealant'],
      };
    case 'gopuram-vimana':
      return {
        estimatedWeeks: scale === 'monumental' ? '16-36 weeks' : scale === 'medium' ? '8-14 weeks' : '4-8 weeks',
        shastraAspect: 'Tiered Dravidian/Nagara vimana kalasam alignment and guardian Yakshas/Dwarapalaka forms.',
        keyMaterials: ['High-tensile Architectural Stucco', 'Copper Kalasam', 'Weather-resistant pigments'],
      };
    default:
      return {
        estimatedWeeks: scale === 'monumental' ? '6-12 weeks' : scale === 'medium' ? '3-5 weeks' : '1-2 weeks',
        shastraAspect: 'Custom devotion-infused composition harmonized with household or sanctum Vastu orientation.',
        keyMaterials: ['Fine Linen Canvas', 'Tanjore Gold Foil', 'Teakwood Framing', 'Natural Varnishes'],
      };
  }
}

/**
 * Validates photo and artwork editing fields
 */
export function validateArtworkData(data: Partial<PortfolioItem>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = 'Artwork title must be at least 3 characters.';
  }

  if (!data.image || data.image.trim().length === 0) {
    errors.image = 'An image URL or uploaded photo is required.';
  } else if (
    !data.image.startsWith('http://') &&
    !data.image.startsWith('https://') &&
    !data.image.startsWith('data:image/')
  ) {
    errors.image = 'Image must be a valid URL (http/https) or uploaded image file.';
  }

  if (!data.medium || data.medium.trim().length < 2) {
    errors.medium = 'Medium / material name is required (e.g. Krishna Shila Stone, Gold Leaf).';
  }

  // Description is optional per user instruction: "no description about my work only my pictures of works shoud be there"
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates an evocative, shastric photo description based on title, category, medium and tone
 */
export function generateEnhancedDescription(
  title: string,
  category: string,
  medium: string,
  tone: 'devotional' | 'technical' | 'grand' | 'concise' = 'devotional'
): string {
  const cleanTitle = (title || 'Sacred Temple Creation').trim();
  const cleanMedium = (medium || 'consecrated traditional materials').trim();

  if (tone === 'technical') {
    return `Sculpted in strict adherence to Kashyapa Shilpa Shastra Agamas and ancient Tala-mana iconometric canons. Crafted using ${cleanMedium}, every proportional grid, mudra alignment, and posture is calculated to anchor sanctified Vastu prana within the temple sanctum.`;
  }

  if (tone === 'grand') {
    return `A monumental masterpiece titled "${cleanTitle}". Executed with supreme devotion in ${cleanMedium}, this sacred installation embodies timeless Vedic spiritual grandeur, featuring intricate ornamental detailing, consecrated auspicious mudras, and durable weather-resilient craftsmanship engineered to endure for generations.`;
  }

  if (tone === 'concise') {
    return `Consecrated ${cleanTitle} rendered in ${cleanMedium}. Designed to canonical temple proportions with refined iconographic elegance.`;
  }

  // Default 'devotional'
  return `A sacred devotional offering depicting ${cleanTitle}, meticulously hand-crafted in ${cleanMedium}. Harmonized with ancient Shilpa Shastra traditions, the divine form expresses serene spiritual grace (Bhava), adorned with traditional ornamentation and aligned for auspicious sanctum sanctity.`;
}

/**
 * Updates an item in the portfolio array
 */
export function updatePortfolioItem(
  items: PortfolioItem[],
  updated: PortfolioItem
): PortfolioItem[] {
  return items.map((item) => (item.id === updated.id ? updated : item));
}

/**
 * Adds a new item to the beginning of the portfolio array
 */
export function addPortfolioItem(
  items: PortfolioItem[],
  newItem: PortfolioItem
): PortfolioItem[] {
  return [newItem, ...items];
}

/**
 * Deletes an item from the portfolio array by id
 */
export function deletePortfolioItem(
  items: PortfolioItem[],
  id: string
): PortfolioItem[] {
  return items.filter((item) => item.id !== id);
}

