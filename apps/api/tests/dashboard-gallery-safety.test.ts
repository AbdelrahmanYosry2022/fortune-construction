import './setup';
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertContains, readRepoFile } from './helpers/staticFileAssertions';

// The API keeps a project's gallery only if the dashboard never sends galleryImages when it
// updates an existing project (projects-gallery.test.ts covers the API side). These checks fail
// if Projects.tsx goes back to saving the gallery with the rest of the form.
test('dashboard saves an existing project without galleryImages and changes photos one by one', () => {
  const source = readRepoFile('apps/dashboard/src/pages/Projects.tsx');

  assert.equal((source.match(/api\.put\(/g) || []).length, 1, 'Projects.tsx should have a single project PUT');
  assertContains(
    source,
    /api\.put\(`\/projects\/\$\{editingId\}`,\s*cleanProjectUpdatePayload\(data\)\)/,
    'The project PUT must send cleanProjectUpdatePayload(data), not the full form',
  );
  assertContains(
    source,
    /function cleanProjectUpdatePayload\(data: ProjectFormData\) \{\s*const \{ galleryImages: _savedSeparately, \.\.\.payload \} = cleanProjectPayload\(data\)\s*return payload\s*\}/,
    'cleanProjectUpdatePayload must leave galleryImages out of the update',
  );
  assertContains(
    source,
    /api\.post\('\/projects',\s*cleanProjectPayload\(data\)\)/,
    'Creating a project still sends its photos with the POST',
  );
  assertContains(
    source,
    /api\.post<ProjectGalleryResponse>\(`\/projects\/\$\{projectId\}\/gallery`,\s*\{ urls: \[url\] \}\)/,
    'Each uploaded photo is added on its own through POST /projects/:id/gallery',
  );
  assertContains(
    source,
    /api\.delete<ProjectGalleryResponse>\(`\/projects\/\$\{projectId\}\/gallery`,\s*\{ data: \{ url \} \}\)/,
    'A removed photo is deleted on its own through DELETE /projects/:id/gallery',
  );
});
