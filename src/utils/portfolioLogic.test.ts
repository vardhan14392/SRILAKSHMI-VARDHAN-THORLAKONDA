import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateInquiryForm,
  filterPortfolioItems,
  generateWhatsAppLink,
  generateEmailLink,
  calculateProjectEstimate,
  validateArtworkData,
  generateEnhancedDescription,
  updatePortfolioItem,
  addPortfolioItem,
  deletePortfolioItem,
  type PortfolioItem,
} from './portfolioLogic.ts';
import { calculateScaledDimensions } from './imageUtils.ts';

test('validateInquiryForm detects missing or invalid fields', () => {
  const emptyResult = validateInquiryForm({
    name: '',
    phone: '',
    service: '',
    message: '',
  });

  assert.equal(emptyResult.isValid, false);
  assert.ok(emptyResult.errors.name);
  assert.ok(emptyResult.errors.phone);
  assert.ok(emptyResult.errors.service);
  assert.ok(emptyResult.errors.message);
});

test('validateInquiryForm accepts valid inquiry data', () => {
  const validResult = validateInquiryForm({
    name: 'Sri Krishna Reddy',
    phone: '+91 9876543210',
    email: 'krishna@reddytrust.org',
    service: 'Temple Sculptures & Murals',
    message: 'We are constructing a Sri Venkateswara Swamy temple sanctum in Tirupati and require idol design and relief murals.',
  });

  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});

test('filterPortfolioItems filters correctly by category and query', () => {
  const mockItems: PortfolioItem[] = [
    {
      id: '1',
      title: 'Lord Shiva Nataraja Bronze & Stone Sculpture',
      category: 'sculptures',
      categoryLabel: 'Sculptures',
      image: 'test1.jpg',
      thumbnail: 'test1.jpg',
      description: 'Hand-carved cosmic dance Nataraja sculpture',
      medium: 'Black Granite Stone',
      tags: ['Shiva', 'Nataraja', 'Granite'],
    },
    {
      id: '2',
      title: 'Vaikuntha Gilded Wall Mural',
      category: 'murals',
      categoryLabel: 'Murals',
      image: 'test2.jpg',
      thumbnail: 'test2.jpg',
      description: 'Ornate 24K gold foil and mineral paint mural',
      medium: 'Gold Leaf & Acrylic',
      tags: ['Vishnu', 'Gold Leaf', 'Mural'],
    },
    {
      id: '3',
      title: 'Raja Gopuram Architectural Stucco Work',
      category: 'temple-art',
      categoryLabel: 'Temple Art',
      image: 'test3.jpg',
      thumbnail: 'test3.jpg',
      description: 'Dravidian 5-tier Gopuram relief carving',
      medium: 'Stucco & Mineral Pigments',
      tags: ['Gopuram', 'Architecture'],
    },
  ];

  // Category filter
  const sculpturesOnly = filterPortfolioItems(mockItems, 'sculptures');
  assert.equal(sculpturesOnly.length, 1);
  assert.equal(sculpturesOnly[0].id, '1');

  // All category
  const allItems = filterPortfolioItems(mockItems, 'all');
  assert.equal(allItems.length, 3);

  // Search query
  const searchedItems = filterPortfolioItems(mockItems, 'all', 'gold');
  assert.equal(searchedItems.length, 1);
  assert.equal(searchedItems[0].id, '2');
});

test('generateWhatsAppLink creates valid click-to-chat URL with proper encoding', () => {
  const link = generateWhatsAppLink('919704926504', {
    name: 'Ramesh Sharma',
    service: 'Temple Interior & Vimana Artwork',
    message: 'Need quotation for 12ft sanctum ceiling mural.',
  });

  assert.ok(link.startsWith('https://wa.me/919704926504?text='));
  assert.ok(link.includes('Ramesh%20Sharma') || link.includes('Ramesh+Sharma'));
  assert.ok(link.includes('Sree%20Guru%20Arts') || link.includes('Sree+Guru+Arts'));
});

test('generateEmailLink creates valid mailto string', () => {
  const mailLink = generateEmailLink('sreeguruarts@gmail.com', {
    name: 'Ananya Verma',
    phone: '9704926504',
    service: 'Custom Deities & Sacred Wall Murals',
    message: 'Requesting portfolio catalog for private prayer hall.',
  });

  assert.ok(mailLink.startsWith('mailto:sreeguruarts@gmail.com?subject='));
  assert.ok(mailLink.includes('Custom%20Deities') || mailLink.includes('Custom+Deities'));
});

test('calculateProjectEstimate outputs timeline and shastra materials', () => {
  const estimate = calculateProjectEstimate('temple-sculptures', 'monumental');
  assert.equal(estimate.estimatedWeeks, '12-24 weeks');
  assert.ok(estimate.keyMaterials.length > 0);
  assert.ok(estimate.shastraAspect.includes('Shilpa Shastra'));
});

test('validateArtworkData detects missing title, image, or description', () => {
  const invalid = validateArtworkData({
    title: '',
    image: '',
    medium: '',
    description: '',
  });

  assert.equal(invalid.isValid, false);
  assert.ok(invalid.errors.title);
  assert.ok(invalid.errors.image);
  assert.ok(invalid.errors.medium);
  assert.ok(invalid.errors.description);

  const valid = validateArtworkData({
    title: 'Surya Narayana Stone Idol',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220',
    medium: 'Krishna Shila Granite',
    description: 'Consecrated Surya Narayana idol sculpted according to Kashyapa Shilpa Shastra.',
  });

  assert.equal(valid.isValid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test('generateEnhancedDescription produces shastra-enriched copy for different tones', () => {
  const technicalDesc = generateEnhancedDescription(
    'Lord Shiva Linga Pedestal',
    'sculptures',
    'Black Granite',
    'technical'
  );
  assert.ok(technicalDesc.includes('Kashyapa Shilpa Shastra'));
  assert.ok(technicalDesc.includes('Tala-mana'));

  const devotionalDesc = generateEnhancedDescription(
    'Sri Lakshmi Devi',
    'murals',
    '24K Gold Leaf',
    'devotional'
  );
  assert.ok(devotionalDesc.includes('Sri Lakshmi Devi'));
  assert.ok(devotionalDesc.includes('Bhava'));
});

test('portfolio CRUD helpers add, update, and delete items cleanly', () => {
  const initialItems: PortfolioItem[] = [
    {
      id: 'item-1',
      title: 'Original Title',
      category: 'sculptures',
      categoryLabel: 'Sculptures',
      image: 'test.jpg',
      thumbnail: 'test.jpg',
      description: 'Original Description',
      medium: 'Stone',
      tags: ['Test'],
    },
  ];

  // Update
  const updated = updatePortfolioItem(initialItems, {
    ...initialItems[0],
    title: 'Edited Title',
    description: 'Edited Description',
  });
  assert.equal(updated[0].title, 'Edited Title');
  assert.equal(updated[0].description, 'Edited Description');

  // Add
  const newItem: PortfolioItem = {
    id: 'item-2',
    title: 'New Idol',
    category: 'temple-art',
    categoryLabel: 'Temple Art',
    image: 'new.jpg',
    thumbnail: 'new.jpg',
    description: 'New Description',
    medium: 'Marble',
    tags: ['New'],
  };
  const withAdded = addPortfolioItem(updated, newItem);
  assert.equal(withAdded.length, 2);
  assert.equal(withAdded[0].id, 'item-2');

  // Delete
  const afterDelete = deletePortfolioItem(withAdded, 'item-1');
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].id, 'item-2');
});

test('calculateScaledDimensions scales down oversized images while maintaining aspect ratio', () => {
  // 4000x3000 -> 1280x960
  const scaledLarge = calculateScaledDimensions(4000, 3000, 1280, 1280);
  assert.equal(scaledLarge.width, 1280);
  assert.equal(scaledLarge.height, 960);

  // 3000x4000 portrait -> 960x1280
  const scaledPortrait = calculateScaledDimensions(3000, 4000, 1280, 1280);
  assert.equal(scaledPortrait.width, 960);
  assert.equal(scaledPortrait.height, 1280);

  // Already small image (600x400) should not be scaled up
  const small = calculateScaledDimensions(600, 400, 1280, 1280);
  assert.equal(small.width, 600);
  assert.equal(small.height, 400);

  // Square image (2000x2000) -> 1280x1280
  const square = calculateScaledDimensions(2000, 2000, 1280, 1280);
  assert.equal(square.width, 1280);
  assert.equal(square.height, 1280);
});


