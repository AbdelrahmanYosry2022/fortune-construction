import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  foundedYear: number;
  heroTitle: string;
  heroBadge: string;
  heroSubtitle: string;
  socialFacebook: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialYoutube: string;
  workingDays: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingHoursDisplay: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SiteSettingsSchema = new Schema<ISiteSettings>({
  companyName: { type: String, default: 'Fortune Construction' },
  tagline: { type: String, default: "Malawi's premier construction company." },
  // Phone and email are optional: the public site hides them when they are empty.
  phone: { type: String, trim: true, default: '' },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: (value: string) => !value || EMAIL_PATTERN.test(value),
      message: 'email must be valid',
    },
  },
  address: { type: String, default: 'Area 4, Lilongwe, Malawi' },
  foundedYear: { type: Number, default: 2004 },
  heroTitle: { type: String, default: 'Crafting Visionary Infrastructure.' },
  heroBadge: { type: String, default: '20 Years of Construction Excellence' },
  heroSubtitle: { type: String, default: 'Fortune Construction Limited delivers world-class civil engineering across Malawi.' },
  socialFacebook: { type: String, default: '' },
  socialTwitter: { type: String, default: '' },
  socialLinkedin: { type: String, default: '' },
  socialYoutube: { type: String, default: '' },
  workingDays: { type: String, default: 'Mon – Fri' },
  workingHoursStart: { type: String, default: '07:30' },
  workingHoursEnd: { type: String, default: '17:00' },
  workingHoursDisplay: { type: String, default: 'Mon – Fri: 7:30am – 5:00pm' },
}, { timestamps: true });

// The dashboard saves settings with findByIdAndUpdate, which skips validators unless asked.
SiteSettingsSchema.pre('findOneAndUpdate', function () {
  this.setOptions({ runValidators: true });
});

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
