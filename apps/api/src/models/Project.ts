import mongoose, { Document, MongooseBaseQueryOptions, Query, Schema } from 'mongoose';

// A deleted project stays in the trash for 30 days (it can be restored), then MongoDB's TTL
// monitor removes it. TTL ignores null and missing values, so live projects are never touched.
export const PROJECT_TRASH_RETENTION_SECONDS = 30 * 24 * 60 * 60;

export interface IProject extends Document {
  title: string;
  category: string;
  status: 'Ongoing' | 'Completed';
  location: string;
  clientName: string;
  projectValue: string;
  budget: string;
  duration: string;
  yearCompleted: string;
  overview: string;
  scopeOfWork: string[];
  technologies: string[];
  challenge: string;
  solution: string;
  result: string;
  coverImage: string;
  galleryImages: string[];
  startDate?: Date;
  endDate?: Date;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  deletedAt: Date | null;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
  location: { type: String, required: true },
  clientName: { type: String, default: '' },
  projectValue: { type: String, default: '' },
  budget: { type: String, default: '' },
  duration: { type: String, default: '' },
  yearCompleted: { type: String, default: '' },
  overview: { type: String, default: '' },
  scopeOfWork: [{ type: String }],
  technologies: [{ type: String }],
  challenge: { type: String, default: '' },
  solution: { type: String, default: '' },
  result: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  // Set when the project is moved to the trash; null while the project is live.
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

// Also the index for deletedAt queries (a second plain index on the same key would conflict).
ProjectSchema.index({ deletedAt: 1 }, { expireAfterSeconds: PROJECT_TRASH_RETENTION_SECONDS });

// Trashed projects are hidden from every read and update by default, so the public site, the
// dashboard list, stats and the sitemap never show them and PUT /:id cannot edit or revive one.
// Pass the query option `includeDeleted: true` to see them; a filter that names deletedAt
// explicitly is left as written. `{ deletedAt: null }` also matches documents without the field.
const EXCLUDE_DELETED_QUERIES = [
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndReplace',
  'countDocuments',
  'distinct',
  'updateOne',
  'updateMany',
  'replaceOne',
] as const;

function excludeDeletedProjects(this: Query<unknown, IProject>): void {
  const options = this.getOptions() as { includeDeleted?: boolean };
  if (options.includeDeleted) return;
  if (Object.prototype.hasOwnProperty.call(this.getFilter(), 'deletedAt')) return;
  this.where({ deletedAt: null });
}

ProjectSchema.pre([...EXCLUDE_DELETED_QUERIES], excludeDeletedProjects);

// Query options for the few places that must see trashed projects as well, e.g.
// Project.countDocuments(filter, INCLUDE_DELETED_PROJECTS).
export const INCLUDE_DELETED_PROJECTS: MongooseBaseQueryOptions = { includeDeleted: true };

export default mongoose.model<IProject>('Project', ProjectSchema);
