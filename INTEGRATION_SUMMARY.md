# MADCAMP WK2 - Frontend/Backend Integration Summary

## Overview
Complete integration between React frontend and Node.js/Prisma backend with fal.ai image processing capabilities.

---

## 1. Issues Fixed

### ✅ Profile Image Display Bug
**Problem**: Profile images weren't displaying on the frontend
**Root Cause**:
- Frontend used `profile_photo_url` but backend returned `profile_img_url`
- Inconsistent field naming between DB schema and API responses

**Solution**:
- Standardized image URL handling in `userService.js:76-88`
- Backend now properly returns `profile_img_url` and `base_photo_url`
- Image URLs are correctly formatted and accessible

**Files Modified**:
- [`backend/src/services/userService.js`](backend/src/services/userService.js#L76-L88)

---

### ✅ Axios Configuration for Production
**Problem**: Axios had empty baseURL, relying on Vite proxy (development only)
**Solution**:
- Added environment-aware baseURL configuration
- Development: Uses Vite proxy (empty baseURL)
- Production: Uses K-Cloud VM IP `http://172.10.5.178`
- Added comprehensive error handling and request/response interceptors
- Automatic 401 redirect to login
- 30-second timeout for all requests

**Files Modified**:
- [`frontend/src/api/axios.js`](frontend/src/api/axios.js)

**Key Features**:
```javascript
// Auto-detects environment
const baseURL = import.meta.env.DEV ? '' : 'http://172.10.5.178';

// Error handling
- 401: Auto-redirect to login
- Network errors: Logged to console
- Server errors: Extracted message from response
```

---

### ✅ CORS Configuration
**Problem**: Basic CORS without proper origin validation
**Solution**:
- Configured specific allowed origins
- Supports both development and production environments
- Includes credentials support for cookies/auth headers
- Proper preflight request handling

**Files Modified**:
- [`backend/src/app.js`](backend/src/app.js#L16-L48)

**Allowed Origins**:
- `http://172.10.5.178` (Production)
- `http://172.10.5.178:80` (Production with port)
- `http://172.10.5.178:5173` (Vite dev server)
- `http://localhost:5173` (Local development)
- `http://localhost:3000` (Backend test)
- Custom origin from `FRONTEND_URL` env variable

---

## 2. New Features Implemented

### 🆕 Garment Management System (fal.ai Integration)

Complete system for uploading garment images with automatic background removal using fal.ai.

#### Database Schema
**New Model**: `Garment`
```prisma
model Garment {
  garment_id           Int      @id @default(autoincrement())
  user_id              Int
  original_image_url   String   // Original uploaded image
  processed_image_url  String?  // Background-removed image from fal.ai
  category             Category?
  name                 String?
  description          String?  @db.Text
  processing_status    String   @default("pending")
  ai_metadata          Json?
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  deleted_at           DateTime?

  user                 User     @relation(fields: [user_id], references: [user_id], onDelete: Cascade)

  @@index([user_id])
  @@index([processing_status])
}
```

#### API Endpoints
Base URL: `/api/garments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Upload garment image (triggers background removal) |
| GET | `/` | List user's garments (with filters) |
| GET | `/:garmentId` | Get single garment details |
| PATCH | `/:garmentId` | Update garment metadata |
| DELETE | `/:garmentId` | Soft delete garment |
| GET | `/:garmentId/status` | Check processing status |

#### Frontend Services
All garment-related API calls available in `frontend/src/api/services.js`:

```javascript
// Upload garment with metadata
await uploadGarment(file, {
  name: 'Red Hoodie',
  category: 'TOP',
  description: 'Casual red hoodie'
});

// Get all garments
const garments = await getGarments({
  status: 'completed',
  category: 'TOP'
});

// Check processing status
const status = await getGarmentStatus(garmentId);
```

#### Background Processing Flow
1. User uploads image → Saved to `backend/public/images/uploads/`
2. Garment record created with `processing_status: 'processing'`
3. Background removal runs asynchronously (fal.ai/imgly)
4. Processed image saved to `backend/public/images/garments/`
5. Status updated to `'completed'` or `'failed'`
6. Frontend can poll `/garments/:id/status` for updates

**Files Created**:
- [`backend/src/services/garmentService.js`](backend/src/services/garmentService.js)
- [`backend/src/controllers/garmentController.js`](backend/src/controllers/garmentController.js)
- [`backend/src/routes/garmentRoutes.js`](backend/src/routes/garmentRoutes.js)

**Files Modified**:
- [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma#L291-L309) - Added Garment model
- [`backend/src/routes/index.js`](backend/src/routes/index.js#L26) - Added garment routes
- [`backend/src/services/aiService.js`](backend/src/services/aiService.js#L49) - Exported removeBackground
- [`frontend/src/api/services.js`](frontend/src/api/services.js#L93-L135) - Added garment API calls

---

## 3. Data Consistency

### Schema Compliance
All API responses now strictly follow the Prisma schema field names:

**User Profile**:
```javascript
{
  name: String,           // → userName in DB
  profile_img_url: String, // → profile_img_url in DB
  base_photo_url: String,  // → basePhotoUrl in DB
  measurements: {
    height, weight, shoulderWidth, chestCircum,
    waistCircum, hipCircum, armLength, legLength,
    neckCircum, wristCircum, shoeSize  // → footSize in DB
  },
  // ...other fields
}
```

**Image URL Format**:
- All URLs stored as `/images/uploads/filename.ext`
- Served via Express static middleware at `/images` and `/uploads`
- Accessible in production at `http://172.10.5.178/images/uploads/...`

---

## 4. Deployment Instructions

### Prerequisites
- K-Cloud VM at `172.10.5.178`
- PostgreSQL database running
- Node.js installed
- Nginx configured (port 80, `/api` → `localhost:3000`)

### Step 1: Database Migration
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name add_garment_model
```

### Step 2: Environment Variables
Create/update `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
FAL_KEY="your-fal-ai-api-key"
PORT=3000
FRONTEND_URL="http://172.10.5.178"
```

Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=http://172.10.5.178
```

### Step 3: Backend Deployment
```bash
cd backend
npm install
npm run generate  # Generate Prisma client
npm start         # or use PM2: pm2 start server.js --name modif-backend
```

### Step 4: Frontend Build & Deploy
```bash
cd frontend
npm install
npm run build     # Creates dist/ folder
```

Configure Nginx to serve the built frontend:
```nginx
server {
    listen 80;
    server_name 172.10.5.178;

    # Serve frontend static files
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded images
    location /images {
        alias /path/to/backend/public/images;
    }

    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

### Step 5: Verify Deployment
1. Check backend health: `http://172.10.5.178/api-docs`
2. Test frontend: `http://172.10.5.178`
3. Test login and profile image upload
4. Test garment upload with background removal

---

## 5. API Testing

### Using Swagger UI
Visit: `http://172.10.5.178/api-docs`

All endpoints are documented with:
- Request/response schemas
- Example payloads
- Try-it-out functionality

### Example API Calls

**Login**:
```bash
curl -X POST http://172.10.5.178/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Upload Garment**:
```bash
curl -X POST http://172.10.5.178/api/garments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@/path/to/image.jpg" \
  -F "name=Red Hoodie" \
  -F "category=TOP"
```

**Get Profile**:
```bash
curl http://172.10.5.178/api/users/me/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 6. Error Handling

### Backend
All errors follow consistent format:
```javascript
{
  success: false,
  error: "Error message here",
  statusCode: 400 // or 401, 404, 500, etc.
}
```

Handled by `errorMiddleware` in [`backend/src/middlewares/errorMiddleware.js`](backend/src/middlewares/errorMiddleware.js)

### Frontend
- Network errors: Logged to console, displayed to user
- 401 Unauthorized: Automatic redirect to login page
- All API errors extracted from `response.data.message`

---

## 7. Background Removal Technical Details

### Technology Stack
- **Primary**: `@imgly/background-removal-node` (runs locally, fast)
- **Fallback**: fal.ai API (if configured with FAL_KEY)

### Processing Flow
1. Image uploaded to `backend/public/images/uploads/`
2. Garment record created in DB
3. `removeBackground()` called asynchronously
4. Processes image using imgly library
5. Saves transparent PNG to `backend/public/images/garments/`
6. Updates DB with `processed_image_url` and status

### Performance
- Local processing (imgly): ~2-5 seconds per image
- No external API calls needed (unless using fal.ai fallback)
- Runs in background (non-blocking)

---

## 8. Schema Relationships

```
User (1) ──→ (0-1) Brand
     ↓
     (1) ──→ (many) Garment
     (1) ──→ (many) Fitting
     (1) ──→ (many) Comment
     (1) ──→ (many) Invest
     (1) ──→ (many) Notification

Brand (1) ──→ (many) Cloth
      (1) ──→ (many) Follow

Cloth (1) ──→ (0-1) Fund
      (1) ──→ (many) DesignAttempt

Fund (1) ──→ (many) Comment
     (1) ──→ (many) Invest
```

---

## 9. Security Considerations

### Authentication
- JWT tokens stored in localStorage
- Tokens sent via `Authorization: Bearer` header
- Middleware validates tokens on protected routes

### File Uploads
- 10MB file size limit
- Only authenticated users can upload
- Files organized by category in subdirectories
- Unique filenames prevent collisions

### CORS
- Specific origin whitelist
- Credentials support enabled
- Preflight caching (10 minutes)

---

## 10. Monitoring & Debugging

### Backend Logs
Check console output for:
- `✅ 데이터베이스 연결 성공` - DB connected
- `🚀 서버가 포트 3000에서 작동 중입니다.` - Server started
- `[AI] Removing background (Local) for: ...` - Background removal
- `[Garment] Background removal completed for garment #X` - Success

### Frontend Debugging
Open browser console:
- Check `axios` requests/responses
- Look for CORS errors
- Verify API baseURL is correct
- Check localStorage for token

### Common Issues

**Profile image not showing**:
- Verify image path starts with `/images/uploads/`
- Check file exists in `backend/public/images/uploads/`
- Ensure Nginx serves `/images` correctly

**Background removal not working**:
- Check `processing_status` field in database
- Look for error in `ai_metadata` JSON field
- Verify imgly library installed: `npm list @imgly/background-removal-node`

**CORS errors**:
- Add origin to `allowedOrigins` in `backend/src/app.js`
- Restart backend server after CORS changes

---

## 11. Next Steps & Recommendations

### Performance Optimization
- [ ] Implement image CDN for faster delivery
- [ ] Add Redis caching for frequently accessed data
- [ ] Compress images before storage (use Sharp)
- [ ] Implement pagination for garment lists

### Features
- [ ] Real-time status updates (WebSocket/SSE) for background removal
- [ ] Batch garment upload
- [ ] Image editing before background removal
- [ ] 3D model generation integration

### DevOps
- [ ] Set up PM2 for backend process management
- [ ] Configure automatic restarts on crashes
- [ ] Implement logging to files (Winston/Morgan)
- [ ] Set up monitoring (Sentry, New Relic)

---

## 12. Contact & Support

For issues or questions:
- Check Swagger docs: `http://172.10.5.178/api-docs`
- Review backend logs
- Test endpoints with curl/Postman
- Verify database with Prisma Studio: `npx prisma studio`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-21
**System**: MADCAMP WK2 - MODIF AI Fitting Service