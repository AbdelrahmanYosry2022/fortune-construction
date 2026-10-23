// The seed script deletes all content and recreates demo data with admin/admin123.
// It may only run on an empty development database, unless a wipe is asked for explicitly.

export interface SeedGuardInput {
  nodeEnv?: string;
  existingDocuments: number;
  allowWipe?: string;
}

export function seedRefusalReason({ nodeEnv, existingDocuments, allowWipe }: SeedGuardInput): string | undefined {
  if (nodeEnv === 'production') {
    return 'Refusing to run the seed script in production: it deletes existing content.';
  }
  if (existingDocuments > 0 && allowWipe !== 'yes') {
    return `Refusing to run the seed script: the database already holds ${existingDocuments} admin/project records that it would delete. Set SEED_ALLOW_WIPE=yes to wipe it on purpose.`;
  }
  return undefined;
}
