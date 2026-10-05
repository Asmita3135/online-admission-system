# Online Admission System — MEAN Stack POC

A academic proof-of-concept (POC) web application built using the MEAN stack (MongoDB, Express.js, Angular, Node.js) for an Online Admission System featuring document upload (marksheet) and an admin dashboard.

---

## 1. Project Overview

The **Online Admission System** demonstrates an end-to-end request-response cycle across the MEAN stack. Applicants submit their details along with their marksheet document, while administrative staff can view, search, filter, review documents, and update application status.

---

## 2. Technology Stack

- **Frontend:** Angular (v22), TypeScript, HTML5, Plain CSS, Reactive Forms, HttpClient, Angular Router.
- **Backend:** Node.js, Express.js, Mongoose ODM, Multer middleware, CORS, dotenv.
- **Database:** MongoDB (configured via MONGODB_URI).
- **Storage:** Local filesystem (`backend/uploads/`).

---

## 3. Main Features

- **Applicant Form:** Submit personal info, academic details, and marksheet upload.
- **Strict Validation:** Both client-side (Reactive Forms) and server-side validation.
- **Document Handling:** Multer file storage, unique timestamp filenames, path traversal sanitization, PDF/JPG/JPEG/PNG format validation, 5 MB file size limit, and orphan file auto-cleanup.
- **Admin Dashboard:** View applications in a clean responsive table sorted newest first.
- **Real-Time Client-Side Filtering:** Search by name or email (case-insensitive), filter by Department (CSE, ECE, IT), and filter by Status (Submitted, Review, Selected, Rejected).
- **Application Details View:** Full applicant details page (`/admin/:id`) with one-click document opening in a new browser tab.
- **Status Updates:** Update application status via PUT API with backend enum validation.

---

## 4. Project Structure

```text
SWE_MEAN/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection module
│   ├── controllers/
│   │   └── applicationController.js # API request controllers
│   ├── middleware/
│   │   └── upload.js             # Multer upload & validation middleware
│   ├── models/
│   │   └── Application.js        # Mongoose application schema
│   ├── routes/
│   │   └── applicationRoutes.js   # REST API route endpoints
│   ├── uploads/
│   │   └── .gitkeep              # Local file storage folder
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entry point
│
├── frontend/
│   └── admission-app/
│       ├── src/
│       │   └── app/
│       │       ├── components/
│       │       │   ├── navbar/               # Reusable Navbar component
│       │       │   ├── admission-form/       # Applicant form component
│       │       │   ├── application-list/     # Admin dashboard table component
│       │       │   └── application-details/  # Single application details view
│       │       ├── models/
│       │       │   └── application.ts        # TypeScript interfaces
│       │       └── services/
│       │           └── application.service.ts # Angular HttpClient service
│       ├── package.json
│       └── angular.json
│
├── .gitignore
├── PRD-Online-Admission-System.md
├── PROJECT_WRITEUP.md
└── README.md
```

---

## 5. How the System Works

$$\text{Angular} \longrightarrow \text{HttpClient} \longrightarrow \text{Express} \longrightarrow \text{Multer / Mongoose} \longrightarrow \text{MongoDB} \longrightarrow \text{Express} \longrightarrow \text{Angular}$$

1. **Angular (Frontend):** Renders UI components and captures form inputs using Reactive Forms.
2. **HttpClient:** Asynchronously transmits `FormData` (containing text fields and binary file) to Express.
3. **Express:** Routes API endpoints, handles requests, and runs middleware.
4. **Multer:** Intercepts `multipart/form-data`, validates file size and extension, and writes physical file to `backend/uploads/`.
5. **Mongoose:** Validates schema constraints and persists application records to MongoDB.
6. **MongoDB:** Stores applicant details along with `documentName` and `documentPath`.
7. **Response Cycle:** Express returns JSON back to Angular, which updates the view reactively.

---

## 6. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning backend status |
| `POST` | `/api/applications` | Submit application form with marksheet document |
| `GET` | `/api/applications` | Retrieve all applications (newest first) |
| `GET` | `/api/applications/:id` | Retrieve application details by ID |
| `PUT` | `/api/applications/:id/status` | Update application status (`Submitted`, `Review`, `Selected`, `Rejected`) |
| `GET` | `/uploads/<filename>` | Serve stored marksheet document statically |

---

## 7. Setup & Run Instructions

### Prerequisites
- Node.js (`v18+` or `v24+`)
- npm (`v10+`)
- Local MongoDB or MongoDB Atlas URI (Optional for testing error handling)

### Backend Setup
```powershell
cd backend
npm install
node server.js
```
- Backend runs on `http://localhost:5000`
- Environment variables in `backend/.env`:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/online_admission
  ```

### Frontend Setup
```powershell
cd frontend/admission-app
npm install
npx ng serve --port 4200
```
- Angular app runs on `http://localhost:4200`

---

## 8. Usage Guide

1. Open `http://localhost:4200/` to view the **Admission Application Form**.
2. Fill out all required fields (Name, Email, Phone, DOB, Department, Marks, Address) and select a marksheet file (PDF/JPG/PNG).
3. Click **Submit Application**.
4. Navigate to `http://localhost:4200/admin` to open the **Admin Applications Dashboard**.
5. Use the Search box and Department/Status dropdowns to filter applications.
6. Click **View** on any application row to open the details view (`/admin/:id`).
7. Click **View Marksheet** to open the stored document in a new browser tab.
8. Select a new status from the dropdown and click **Update Status**.

---

## 9. Validation and Error Handling

- **Required Fields:** All 8 form fields are strictly required.
- **Field Constraints:** Email pattern, 10–15 digit phone number, past date of birth, 0–100 marks range.
- **Document Rules:** PDF, JPG, JPEG, PNG only; maximum file size 5 MB.
- **Orphan File Cleanup:** If validation fails after Multer saves a file, or if MongoDB save throws an error, `deleteFile()` automatically unlinks the uploaded file from `backend/uploads/`.
- **Database Failure Handling:** Returns clean JSON error responses (`HTTP 500`) without leaking internal stack traces.

---

## 10. Testing Summary

- **Angular Build:** `npx ng build` passed with 0 compilation errors.
- **Backend API:** All endpoints (`GET /health`, `POST /applications`, `GET /applications`, `GET /:id`, `PUT /:id/status`, `GET /uploads/`) verified.
- **File Handling:** Rejection of text/executable files, >5 MB file rejection, and orphan file deletion verified.
- **Offline Database State:** During local testing, MongoDB was offline (`ECONNREFUSED 127.0.0.1:27017`). All system layers handled the database offline condition gracefully without crashing or creating fake records.

---

## 11. Known Limitations

- No authentication or role-based access control (Admin page is open for demonstration).
- Files stored on local disk (not cloud object storage).
- No payment gateway, SMS/OTP, or email notifications.

---

## 12. Future Enhancements

- Admin Authentication (JWT-based login).
- Cloud storage integration (AWS S3 / Firebase Storage).
- Automated Email / SMS applicant notifications.
- Pagination & server-side filtering for large datasets.
