import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db';
import { safeLogger } from './utils/safeLogger';
import { seedRefusalReason } from './utils/seedGuard';
import Admin from './models/Admin';
import Project from './models/Project';
import Service from './models/Service';
import Partner from './models/Partner';
import TeamMember from './models/TeamMember';
import JobPosition from './models/JobPosition';
import SiteSettings from './models/SiteSettings';

async function seed() {
  // The seed deletes existing content and creates admin/admin123: never on the live server.
  const productionRefusal = seedRefusalReason({ nodeEnv: process.env.NODE_ENV, existingDocuments: 0 });
  if (productionRefusal) {
    safeLogger.error(productionRefusal);
    process.exit(1);
  }

  await connectDB();

  // NODE_ENV alone is not enough (the server's .env may not set it), so also refuse
  // whenever the database already has content, unless a wipe is requested explicitly.
  const existingDocuments = (await Admin.countDocuments()) + (await Project.countDocuments());
  const dataRefusal = seedRefusalReason({ nodeEnv: process.env.NODE_ENV, existingDocuments, allowWipe: process.env.SEED_ALLOW_WIPE });
  if (dataRefusal) {
    safeLogger.error(dataRefusal);
    process.exit(1);
  }

  await Admin.deleteMany({});
  await Admin.create({ username: 'admin', password: 'admin123' });
  safeLogger.info('Default administrative account seeded.');

  await Project.deleteMany({});
  await Project.insertMany([
    {
      title: 'Lilongwe Grand Bridge',
      category: 'Infrastructure',
      location: 'Lilongwe, Malawi',
      duration: '24 Months',
      budget: '$15M USD',
      challenge: 'Constructing a multi-lane bridge across the Lilongwe River during the rainy season, dealing with unpredictable water levels and soft soil foundations.',
      solution: 'Implemented advanced deep foundation techniques using steel piles and a pre-cast segmental construction method to minimize on-site concrete pouring during heavy rains.',
      result: 'Completed 2 months ahead of schedule, significantly reducing traffic congestion in the capital city while maintaining a zero-incident safety record.',
      coverImage: 'https://images.unsplash.com/photo-1545558014-8ab6aa17e307?q=80&w=1200',
      galleryImages: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800', 'https://images.unsplash.com/photo-1590486803622-92fd0d97034c?q=80&w=800'],
      completionDate: 'October 2024',
    },
    {
      title: 'National Commercial Hub',
      category: 'Commercial',
      location: 'Blantyre, Malawi',
      duration: '18 Months',
      budget: '$22M USD',
      challenge: 'Building a 15-story modern commercial skyscraper in a dense urban area with strict noise and space constraints.',
      solution: 'Utilized just-in-time material delivery and quiet construction technologies. Designed an energy-efficient glass facade tailored to the local climate.',
      result: "Delivered Malawi's first LEED-certified commercial building, setting a new standard for sustainable architecture in the region.",
      coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200',
      galleryImages: ['https://images.unsplash.com/photo-1545558014-8ab6aa17e307?q=80&w=800'],
      completionDate: 'March 2025',
    },
    {
      title: 'Mzuzu Highway Expansion',
      category: 'Infrastructure',
      location: 'Mzuzu to Nkhata Bay',
      duration: '36 Months',
      budget: '$45M USD',
      challenge: 'Upgrading a critical 50km mountainous road segment prone to landslides and heavy erosion.',
      solution: 'Engineered robust retaining walls, improved drainage systems, and utilized high-grade asphalt designed for extreme temperature variations.',
      result: 'Dramatically improved trade route efficiency and safety, reducing travel time by 40% and stimulating local economic growth.',
      coverImage: 'https://images.unsplash.com/photo-1590486803622-92fd0d97034c?q=80&w=1200',
      galleryImages: ['https://images.unsplash.com/photo-1541888086925-920a0f6707dd?q=80&w=800'],
      completionDate: 'December 2023',
    },
  ]);
  console.log('✅ Projects seeded');

  await Service.deleteMany({});
  await Service.insertMany([
    { title: 'Roads & Infrastructure', tagline: 'Connecting Malawi, Mile by Mile', description: "From rural feeder roads to major national highways, we engineer and construct road infrastructure that withstands Malawi's diverse terrain and climate.", features: ['Highway Construction', 'Drainage Systems', 'Bridges & Culverts', 'Road Rehabilitation'], bgImage: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800', order: 1 },
    { title: 'Building & Commercial Construction', tagline: 'Spaces That Work and Inspire', description: 'We deliver commercial offices, government facilities, schools, hospitals, and residential estates.', features: ['Commercial Offices', 'Government Facilities', 'Residential Estates', 'Educational Institutions'], bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', order: 2 },
    { title: 'Bridges & Structural Works', tagline: 'Engineering That Endures Generations', description: 'Complex structural projects demand exceptional engineering. Our experienced teams plan, design, and construct bridges.', features: ['RC Bridge Construction', 'Steel Structures', 'Retaining Walls', 'Structural Rehabilitation'], bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', order: 3 },
  ]);
  console.log('✅ Services seeded');

  await Partner.deleteMany({});
  await Partner.insertMany([
    { name: 'Ministry of Public Works', abbr: 'MPW', order: 1 },
    { name: 'African Development Bank', abbr: 'AfDB', order: 2 },
    { name: 'World Bank Group', abbr: 'WBG', order: 3 },
    { name: 'JICA Malawi', abbr: 'JICA', order: 4 },
    { name: 'EU Development', abbr: 'EU', order: 5 },
    { name: 'ROADS Authority', abbr: 'RA', order: 6 },
    { name: 'National Construction', abbr: 'NCI', order: 7 },
    { name: 'Malawi Housing Corp', abbr: 'MHC', order: 8 },
  ]);
  console.log('✅ Partners seeded');

  await TeamMember.deleteMany({});
  await TeamMember.insertMany([
    { name: 'David Chen', role: 'Managing Director', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800', order: 1 },
    { name: 'Sarah Banda', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800', order: 2 },
    { name: 'Michael Tembo', role: 'Chief Engineer', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800', order: 3 },
    { name: 'Elena Phiri', role: 'HSE Director', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800', order: 4 },
  ]);
  console.log('✅ Team seeded');

  await JobPosition.deleteMany({});
  await JobPosition.insertMany([
    { title: 'Senior Civil Engineer', location: 'Lilongwe Head Office', type: 'Full-time', description: 'Lead civil engineering projects from design through completion.', requirements: ['B.Sc. Civil Engineering', '5+ years experience', 'AutoCAD proficiency'], isActive: true },
    { title: 'Construction Project Manager', location: 'Various Sites, Malawi', type: 'Full-time', description: 'Oversee major construction projects ensuring delivery on time and budget.', requirements: ['PMP Certified', '7+ years experience', 'Strong leadership skills'], isActive: true },
    { title: 'HSE Officer', location: 'Blantyre', type: 'Full-time', description: 'Implement and monitor health, safety and environmental policies on site.', requirements: ['NEBOSH Certificate', '3+ years HSE experience', 'Knowledge of Malawi regulations'], isActive: true },
    { title: 'Quantity Surveyor', location: 'Mzuzu', type: 'Full-time', description: 'Manage all cost aspects of construction projects from tender to final account.', requirements: ['B.Sc. Quantity Surveying', '3+ years experience', 'AIQS membership preferred'], isActive: true },
  ]);
  console.log('✅ Job positions seeded');

  await SiteSettings.deleteMany({});
  await SiteSettings.create({
    companyName: 'Fortune Construction',
    tagline: "Malawi's premier construction company since 2004.",
    phone: '+265 1 234 5678',
    email: 'info@fortuneconstruction.mw',
    address: 'Area 4, Lilongwe, Malawi',
    foundedYear: 2004,
    heroTitle: 'Crafting Visionary Infrastructure.',
    heroBadge: '20 Years of Construction Excellence',
    heroSubtitle: 'Fortune Construction Limited delivers world-class civil engineering across Malawi, building the bedrock of national progress.',
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialYoutube: '',
  });
  console.log('✅ Site settings seeded');

  console.log('\n🎉 Database seeded successfully!');
  safeLogger.info('Seed completed; use configured local credentials to sign in.');
  process.exit(0);
}

seed().catch((err) => {
  safeLogger.error('Database seed failed.', err);
  process.exit(1);
});
