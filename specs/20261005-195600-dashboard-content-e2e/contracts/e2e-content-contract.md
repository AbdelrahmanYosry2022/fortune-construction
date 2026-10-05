# E2E Content Propagation Contract

## Endpoints Used by E2E Suite

### 1. Authentication
- `POST /api/auth/login`
  - Body: `{ "username": "admin", "password": "..." }`
  - Returns: `{ "token": "...", "user": { ... } }`

### 2. Projects
- `POST /api/projects` (Admin)
  - Creates project record
- `GET /api/projects` (Public)
  - Lists public projects
- `GET /api/projects/:id` or `/api/projects/slug/:slug` (Public)
  - Fetches project details
- `PUT /api/projects/:id` (Admin)
  - Updates project details
- `DELETE /api/projects/:id` (Admin)
  - Cleans up project record

### 3. Services
- `POST /api/services` (Admin)
- `GET /api/services` (Public)
- `DELETE /api/services/:id` (Admin)

### 4. Page Content
- `GET /api/content/:page` (Public)
- `PUT /api/content/:page/:section` (Admin)

### 5. Jobs / Careers
- `POST /api/jobs` (Admin)
- `GET /api/jobs` (Public) - should only list active jobs unless authenticated admin
- `PUT /api/jobs/:id` (Admin) - toggle active state or update
- `DELETE /api/jobs/:id` (Admin)

### 6. Contact Messages
- `POST /api/messages` (Public)
- `GET /api/messages` (Admin)
- `DELETE /api/messages/:id` (Admin)

### 7. Uploads
- `POST /api/uploads` (Admin - multipart/form-data)
  - File key: `file` or `image`
  - Returns: `{ "url": "/uploads/filename.png" }`
