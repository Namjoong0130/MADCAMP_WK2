# Quick Reference Guide - MADCAMP WK2

## 🚀 Quick Start

### Deploy Everything
```bash
./deploy.sh
```

### Start Backend Only
```bash
cd backend
npm start
```

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```

---

## 📡 API Endpoints Reference

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "pass123" }

# Signup
POST /api/auth/signup
Body: { "email": "...", "password": "...", "userName": "...", "height": 170, "weight": 70 }
```

### User Profile
```bash
# Get current user
GET /api/users/me
Headers: Authorization: Bearer TOKEN

# Get full profile
GET /api/users/me/profile
Headers: Authorization: Bearer TOKEN

# Update profile
PATCH /api/users/me/profile
Headers: Authorization: Bearer TOKEN
Body: { "name": "...", "profile_img_url": "...", "styleTags": [...] }

# Upload profile photo
POST /api/users/me/photo?type=profile
Headers: Authorization: Bearer TOKEN
Body: FormData with 'photo' field
```

### Garments (NEW - fal.ai Integration)
```bash
# Upload garment with background removal
POST /api/garments
Headers: Authorization: Bearer TOKEN
Body: FormData
  - photo: file
  - name: "Red Hoodie" (optional)
  - category: "TOP" (optional)
  - description: "..." (optional)

# List user's garments
GET /api/garments?status=completed&category=TOP
Headers: Authorization: Bearer TOKEN

# Get garment status (check if background removal is done)
GET /api/garments/:id/status
Headers: Authorization: Bearer TOKEN

# Update garment
PATCH /api/garments/:id
Headers: Authorization: Bearer TOKEN
Body: { "name": "...", "category": "..." }

# Delete garment
DELETE /api/garments/:id
Headers: Authorization: Bearer TOKEN
```

### Brands
```bash
# Create brand
POST /api/brands
Headers: Authorization: Bearer TOKEN
Body: { "brand_name": "...", "brand_story": "..." }

# List public brands
GET /api/brands/public
```

### Funds
```bash
# Get funding feed
GET /api/funds/feed

# Toggle like
POST /api/funds/:id/like
Headers: Authorization: Bearer TOKEN
```

### Comments
```bash
# Get comments
GET /api/funds/:fundId/comments

# Create comment
POST /api/funds/:fundId/comments
Headers: Authorization: Bearer TOKEN
Body: { "content": "...", "parent_id": null }
```

---

## 🎨 Frontend Services Usage

### Import Services
```javascript
import {
  // Auth
  login, signup, getMe, getProfile, updateProfile, uploadProfilePhoto,

  // Garments
  uploadGarment, getGarments, getGarment, updateGarment, deleteGarment, getGarmentStatus,

  // Brands
  createBrand, getBrandProfiles,

  // Funds
  getFundingFeed, toggleLike,

  // Comments
  getFundComments, createFundComment
} from './api/services';
```

### Example Usage
```javascript
// Login
const response = await login('user@example.com', 'password');
localStorage.setItem('token', response.data.token);

// Upload garment with background removal
const file = event.target.files[0];
const garment = await uploadGarment(file, {
  name: 'Red Hoodie',
  category: 'TOP'
});

// Poll for processing status
const checkStatus = async (garmentId) => {
  const status = await getGarmentStatus(garmentId);
  if (status.processing_status === 'completed') {
    console.log('Background removed!', status.processed_image_url);
  } else if (status.processing_status === 'processing') {
    setTimeout(() => checkStatus(garmentId), 2000); // Check again in 2s
  }
};

// Get profile
const profile = await getProfile();
console.log(profile.profile_img_url);

// Update profile
await updateProfile({
  name: 'New Name',
  styleTags: ['casual', 'sporty']
});
```

---

## 🗄️ Database Operations

### Run Migrations
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Open Prisma Studio (DB GUI)
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Seed Database
```bash
npx prisma db seed
```

---

## 🐛 Debugging

### Check Backend Logs
```bash
# If running with PM2
pm2 logs modif-backend

# If running directly
# Logs appear in terminal
```

### Test API Endpoint
```bash
# Using curl
curl -X GET http://172.10.5.178/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Using httpie
http GET http://172.10.5.178/api/users/me \
  Authorization:"Bearer YOUR_TOKEN"
```

### Check Database Connection
```bash
cd backend
npx prisma db pull  # Should connect and pull schema
```

### View Garment Processing Status
```sql
-- In Prisma Studio or psql
SELECT garment_id, name, processing_status, created_at, updated_at
FROM "Garment"
WHERE processing_status = 'processing'
ORDER BY created_at DESC;
```

---

## 📁 Important File Locations

### Configuration Files
- Backend env: `backend/.env`
- Frontend env (prod): `frontend/.env.production`
- Frontend env (dev): `frontend/.env.local`
- Database schema: `backend/prisma/schema.prisma`

### Upload Directories
- Profile images: `backend/public/images/uploads/`
- Garment originals: `backend/public/images/uploads/`
- Garment processed: `backend/public/images/garments/`
- Design images: `backend/public/images/designs/`
- Fitting results: `backend/public/images/fittings/`

### Key Backend Files
- Main server: `backend/server.js`
- App configuration: `backend/src/app.js`
- Routes: `backend/src/routes/index.js`
- Garment service: `backend/src/services/garmentService.js`
- AI service: `backend/src/services/aiService.js`

### Key Frontend Files
- Axios config: `frontend/src/api/axios.js`
- API services: `frontend/src/api/services.js`
- Auth services: `frontend/src/api/auth.js`
- Main app: `frontend/src/App.jsx`

---

## 🔧 Common Tasks

### Add New API Endpoint

1. Create route in `backend/src/routes/yourRoute.js`:
```javascript
router.post('/endpoint', authMiddleware, controller.method);
```

2. Add controller method in `backend/src/controllers/yourController.js`:
```javascript
exports.method = async (req, res, next) => {
  try {
    const result = await service.method(req.user.userId, req.body);
    return success(res, result);
  } catch (error) {
    next(error);
  }
};
```

3. Add service logic in `backend/src/services/yourService.js`:
```javascript
exports.method = async (userId, data) => {
  // Business logic here
  return result;
};
```

4. Register route in `backend/src/routes/index.js`:
```javascript
router.use('/your-path', yourRoutes);
```

5. Add frontend service in `frontend/src/api/services.js`:
```javascript
export const yourMethod = async (data) => {
  const response = await axios.post('/api/your-path/endpoint', data);
  return response.data.data;
};
```

### Update Database Schema

1. Edit `backend/prisma/schema.prisma`
2. Run migration:
```bash
npx prisma migrate dev --name describe_your_change
```
3. Generated client will auto-update
4. Update services to use new fields

---

## 🌐 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-secret-key-here"
FAL_KEY="fal-ai-api-key-if-using"
PORT=3000
FRONTEND_URL="http://172.10.5.178"
```

### Frontend (.env.production)
```env
VITE_API_BASE_URL=http://172.10.5.178
```

### Frontend (.env.local for dev)
```env
# Empty or omit VITE_API_BASE_URL to use Vite proxy
```

---

## 🚨 Troubleshooting

### "Profile image not showing"
- Check: Image URL format in DB
- Check: File exists in `backend/public/images/uploads/`
- Check: Nginx serves `/images` path
- Check: CORS allows the origin

### "CORS error"
- Add origin to `backend/src/app.js` allowedOrigins
- Restart backend server
- Clear browser cache

### "Background removal stuck"
- Check `processing_status` in database
- Check backend logs for errors
- Verify imgly package installed
- Check `ai_metadata` field for error details

### "Can't connect to database"
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running
- Test connection: `npx prisma db pull`

### "Axios network error"
- Check backend is running: `curl http://localhost:3000/api-docs`
- Verify baseURL in `frontend/src/api/axios.js`
- Check browser console for specific error

---

## 📚 Documentation Links

- Swagger API Docs: `http://172.10.5.178/api-docs`
- Prisma Studio: `http://localhost:5555` (when running)
- Full Integration Guide: [`INTEGRATION_SUMMARY.md`](INTEGRATION_SUMMARY.md)

---

**Last Updated**: 2026-01-21