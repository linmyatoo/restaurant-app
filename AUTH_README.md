# Authentication Setup

This application now has authentication for the admin route to secure administrative functions.

## Features

- **Login Page**: `/login` - Admin must authenticate before accessing the admin dashboard
- **Protected Admin Route**: `/admin` - Requires authentication token
- **Token Verification**: Automatically verifies token on page load
- **Logout Functionality**: Logout button in admin dashboard
- **Protected API Endpoints**:
  - `POST /api/menu` - Create menu items (admin only)
  - `POST /api/upload` - Upload images (admin only)
  - `GET /api/orders/active` - View active orders (admin only)

## Default Credentials

**⚠️ IMPORTANT: Change these in production!**

- **Username**: `admin`
- **Password**: `admin123`

## Setup

### Server Configuration

1. Make sure your `.env` file has these variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_TOKEN=admin123
```

2. In production, use:
   - Strong passwords
   - JWT tokens with expiration
   - Password hashing (bcrypt)
   - HTTPS only

### How It Works

1. **Login Flow**:

   - User visits `/login`
   - Enters username and password
   - Server validates credentials
   - On success, server returns a token
   - Client stores token in `localStorage`
   - User is redirected to `/admin`

2. **Protected Routes**:

   - Admin route checks for valid token
   - If no token or invalid token, redirects to `/login`
   - Token is sent with all API requests in `Authorization` header

3. **API Authentication**:

   - Protected endpoints use `adminAuth` middleware
   - Middleware checks `Authorization: Bearer <token>` header
   - Returns 401/403 if unauthorized

4. **Logout**:
   - Removes token from `localStorage`
   - Redirects to login page

## Usage

### Accessing Admin Dashboard

1. Navigate to `http://localhost:3000/admin`
2. You'll be redirected to `/login` if not authenticated
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. After successful login, you'll be redirected to the admin dashboard

### Logging Out

Click the "Logout" button in the top-right corner of the admin dashboard.

## Security Considerations

**Current Implementation** (Development Only):

- Simple token-based authentication
- Plain text password comparison
- Static token stored in environment variables

**For Production, Implement**:

1. **JWT Tokens**: Use `jsonwebtoken` package for token generation/verification
2. **Password Hashing**: Use `bcrypt` to hash passwords
3. **Token Expiration**: Set token expiration times
4. **Refresh Tokens**: Implement refresh token mechanism
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Add rate limiting to prevent brute force attacks
7. **Session Management**: Consider using sessions or cookies
8. **Environment Security**: Use proper secret management (AWS Secrets Manager, etc.)

## Files Modified

### Backend

- `server/src/middleware/auth.js` - Authentication middleware
- `server/src/api/auth.routes.js` - Login/logout/verify endpoints
- `server/src/api/menu.routes.js` - Protected POST route
- `server/src/api/upload.routes.js` - Protected POST route
- `server/src/api/order.routes.js` - Protected GET /active route
- `server/src/server.js` - Added auth routes

### Frontend

- `client/src/pages/LoginPage.js` - Login UI
- `client/src/components/ProtectedRoute.js` - Route protection wrapper
- `client/src/pages/AdminView.js` - Added auth headers and logout button
- `client/src/App.js` - Added login route and protected admin route

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout (client-side token removal)
- `GET /api/auth/verify` - Verify token validity

### Protected Endpoints (Require Auth Token)

- `POST /api/menu` - Create menu item
- `POST /api/upload` - Upload image
- `GET /api/orders/active` - Get active orders

### Public Endpoints

- `GET /api/menu` - Get all menu items
- `GET /api/orders/kitchen/:kitchenId` - Get kitchen orders
- `POST /api/orders` - Place customer order (via Socket.io)

## Testing

1. Try accessing `/admin` without logging in - should redirect to `/login`
2. Login with wrong credentials - should show error
3. Login with correct credentials - should access admin dashboard
4. Try creating menu item - should work with valid token
5. Logout and try to access `/admin` again - should redirect to `/login`
