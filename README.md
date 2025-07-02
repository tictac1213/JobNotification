# Job Notification Platform

A full-stack platform for college job notifications, built with **Node.js/Express** (backend) and **React + Vite** (frontend).

**GitHub Repo:** [https://github.com/tictac1213/JobNotification.git](https://github.com/tictac1213/JobNotification.git)

---

## Features
- JWT authentication (student/admin)
- Admin approval workflow for students
- Company, announcement, and task management
- Email notifications (Mailjet, first 100 students)
- Responsive React frontend with protected routes

---

## Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Atlas or local)
- Mailjet account (free tier is sufficient)
- (Optional for production) Custom domain for best email deliverability

---

## 1. Backend Setup

### A. Clone and Install
```bash
git clone https://github.com/tictac1213/JobNotification.git
cd JobNotification/Backend
npm install
```

### B. Environment Variables
Create a `.env` file in `Backend/`:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key

MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key
MAILJET_FROM=your_verified_gmail_address@gmail.com
```
- Get Mailjet API keys from [Mailjet dashboard](https://app.mailjet.com/account/api_keys).
- Add your Gmail address as a sender in Mailjet and verify it.

### C. Seed Courses
```bash
node utils/seedCourses.js
```

### D. Start Backend
**Development:**
```bash
npm run dev
```
**Production:**
```bash
NODE_ENV=production npm start
```

---

## 2. Frontend Setup

### A. Install
```bash
cd ../FrontEnd
npm install
```

### B. Environment Variables
If you need to set API base URLs, create a `.env` file in `FrontEnd/` (optional for Vite):
```
VITE_API_URL=http://localhost:5000/api
```

### C. Run Frontend
**Development:**
```bash
npm run dev
```
**Production Build:**
```bash
npm run build
```
- The production build will be in the `dist/` folder.

---

## 3. Email Notification Logic
- Only the **first 100 registered students** (across all years) will receive emails.
- All emails are sent via Mailjet using the sender address you verified.
- Admins are not included in student email notifications unless they are among the first 100 students.

---

## 4. Deployment

### A. Deploy Backend
- Deploy to any Node.js hosting (Render, Railway, Heroku, DigitalOcean, AWS, etc.).
- Set all environment variables in your host's dashboard.
- Use a process manager like PM2 for reliability.

### B. Deploy Frontend
- Deploy the `dist/` folder to any static hosting (Vercel, Netlify, Render, Surge, etc.).
- Set the API URL in your frontend to point to your deployed backend.

---

## 5. Testing Email Delivery
To test email delivery to the first 100 students:
```bash
cd Backend
node test-email.js
```
- Check your Mailjet dashboard for delivery status.
- Emails may go to spam if using a Gmail sender; for best results, use a custom domain.

---

## 6. Security & Best Practices
- Never commit `.env` files to your repository.
- Use strong secrets and secure your MongoDB.
- For production, use HTTPS and a custom domain for best email deliverability.

---

## 7. Support
If you need help with deployment or Mailjet setup, check:
- [Mailjet Docs](https://dev.mailjet.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
