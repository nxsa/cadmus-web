1. Objective

Enable authenticated image uploads to cloud storage and dynamically render them on the homepage without requiring a site rebuild.

Images should:

• Upload via private admin page
• Be stored in object storage
• Be automatically ordered by upload time (newest first)
• Be fetched dynamically at runtime
• Be optimized for performance

2. Scope
   In Scope

• Private upload page
• Authentication for admin access
• Drag and drop image upload
• Image storage in object storage (R2 recommended)
• Automatic ordering by upload timestamp
• Public API endpoint to fetch image list
• Frontend dynamic rendering
• Basic validation (file type, size limit)

Out of Scope (for now)

• Manual ordering
• Image editing tools
• Caption management
• Categories or tags
• Multi-user admin
• Analytics

3. Functional Requirements
   3.1 Authentication

Requirement:
Admin-only access to upload page.

Acceptance Criteria:

• Upload page is protected via auth middleware
• Only authenticated admin can access
• Unauthenticated users are redirected

Suggested implementation:
Simple session-based auth or token-based system.
Single admin account stored securely via environment variables or database.

Security must:
• Prevent direct upload endpoint access without auth
• Validate server-side, not just client-side

3.2 Private Upload Page

Route:
/admin/upload

Features:

• Drag-and-drop upload area
• Multiple image upload support
• Upload progress indicator
• Success / error feedback
• Image preview before upload

Validation:

• Accept only image types (webp, jpg, png)
• Max file size limit (e.g. 5MB or 10MB)
• Reject invalid files server-side

3.3 Storage

Storage Provider:
Cloudflare R2 (or S3-compatible object storage)

Bucket structure:

/portfolio/
2026-03-02T211530-projectname.webp

Naming strategy:

timestamp-originalname.webp

This guarantees:
• Automatic chronological ordering
• No collisions
• Predictable sorting

Images stored as:

Optimized WebP or AVIF preferred
Original upload optional (not required)

3.4 Upload API (Nuxt Server Route)

Endpoint:
POST /api/admin/upload

Responsibilities:

• Verify authentication
• Validate file type
• Validate file size
• Generate timestamped filename
• Upload to R2
• Return uploaded image URL

Response shape:

{
success: true,
url: "https://cdn.yoursite.com/portfolio/2026-03-02T211530-projectname.webp
"
}

3.5 Image Listing API

Endpoint:
GET /api/images

Responsibilities:

• Fetch object list from R2 bucket
• Filter to /portfolio/ prefix
• Sort by last modified date (descending)
• Return array of public URLs

Response shape:

{
images: [
{
url: "...",
uploadedAt: "2026-03-02T21:15:30Z"
}
]
}

Ordering:
Newest first.

3.6 Frontend Rendering

Homepage:

• On mount, fetch /api/images
• Render images in scrolling column
• Lazy load images
• Use responsive sizing
• Display in newest-first order

Must handle:

• Loading state
• Empty state
• Failed request gracefully

4. Non-Functional Requirements
   Performance

• Images must be CDN-delivered
• Use WebP or AVIF
• Implement lazy loading
• Use responsive image sizes

Target:
Lighthouse performance score above 90.

Security

• Upload endpoint protected
• Server-side validation required
• Bucket write permissions restricted to server only
• No direct public listing of bucket

Scalability

• System should support 1000+ images
• No rebuild required for updates
• Pagination optional later

5. Technical Architecture

Admin Flow:

Admin → Upload Page → POST to Nuxt server route → Server validates → Upload to R2 → Return URL

Public Flow:

Visitor → Homepage → GET /api/images → Server lists R2 objects → Return sorted list → Render dynamically

No static image imports in repo.

6. Risks

• Large images affecting performance
• Accidental exposure of upload endpoint
• Unbounded storage growth
• No deletion flow initially

Mitigation:

• Enforce file size limit
• Add delete endpoint later
• Monitor bucket usage

7. Future Enhancements

• Manual drag reorder
• Caption metadata stored as JSON
• Tag filtering
• Animated hover preview
• Image compression pipeline
• Admin dashboard with image grid
