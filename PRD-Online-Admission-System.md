# Product Requirements Document

**Product:** Online Admission System (MEAN Stack POC)
**Context:** Software Engineering Lab, academic proof of concept
**Deep feature:** Document Upload (Multer + MongoDB reference)
**Version:** 1.0 | **Status:** Ready for implementation

---

## 1. Overview

### 1.1 Purpose
Build a small, working POC of an online admission system that demonstrates the full MEAN request-response cycle:

`Angular → Express/Node.js → Multer/Mongoose → MongoDB → Express → Angular`

### 1.2 Goals
- Applicants submit an admission form with a marksheet upload.
- Admins list, search, filter, review, and update the status of applications, and open the uploaded document.
- Every line of code must be explainable in a viva.

### 1.3 Non-Goals (Out of Scope)
Payment gateway, SMS, OTP, email notifications, cloud storage, production deployment or scaling, complex admission workflows, AI/ML, authentication systems, Redux or other state libraries. The POC is not a production admission portal.

### 1.4 Success Criteria
The 17-step end-to-end flow in Section 12 works locally, and all 16 tests in Section 11 pass.

---

## 2. Users

| Role | Capabilities |
|---|---|
| Applicant | Open the form, enter details, upload a marksheet, submit, see the Application ID |
| Admin | View all applications, search, filter, open documents, change status |

No login. `/admin` is openly accessible; this is a documented limitation, not a bug. Add auth only if the lab assignment requires it.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, TypeScript, HTML, plain CSS, HttpClient, Angular Forms (no React, no Tailwind) |
| Backend | Node.js, Express.js, Mongoose, Multer, CORS, dotenv |
| Database | MongoDB (local or Atlas) |

Any dependency beyond this list must be justified in writing. Avoid unused packages.

---

## 4. Functional Requirements

### 4.1 Applicant

| ID | Requirement |
|---|---|
| FR-A1 | Admission form with: Full Name, Email, Phone, Date of Birth, Address, Department, Marks/Percentage, Marksheet upload, and a **Submit Application** button |
| FR-A2 | Client-side validation with clear messages (see 5.1) |
| FR-A3 | Submit as `multipart/form-data` via `ApplicationService` |
| FR-A4 | Loading text "Submitting application..." and submit button disabled while in flight |
| FR-A5 | On success show: "Application Submitted Successfully!", Application ID, Status: Submitted, and a link back to the form |
| FR-A6 | On failure show a clear error (validation error, unsupported file, backend unreachable, generic failure) |

### 4.2 Admin

| ID | Requirement |
|---|---|
| FR-B1 | Table columns: Applicant Name, Email, Department, Marks, Status, Document, Date, Action |
| FR-B2 | Loading text "Loading applications..." while fetching |
| FR-B3 | Search box filtering by name or email |
| FR-B4 | Department filter (All, CSE, ECE, IT) and Status filter (All, Submitted, Review, Selected, Rejected) |
| FR-B5 | Search and filters combine and run client-side on the fetched list |
| FR-B6 | **View Document** opens the file in a new browser tab |
| FR-B7 | Status dropdown per application, persisted through the API |
| FR-B8 | Application details view for a single application (`/admin/:id`) |

### 4.3 Backend

| ID | Requirement |
|---|---|
| FR-S1 | Multer saves files to `backend/uploads/` with unique names, e.g. `1727600000000-marksheet.pdf` |
| FR-S2 | MongoDB stores only `documentName` and `documentPath`, never file contents |
| FR-S3 | Express serves `/uploads` as static files |
| FR-S4 | All important fields are re-validated server-side; never trust Angular validation alone |
| FR-S5 | Consistent JSON responses with correct HTTP status codes |

---

## 5. Validation Rules

### 5.1 Fields (enforced on frontend and backend)

| Field | Rule | Example message |
|---|---|---|
| name | Required, non-empty | Please enter your full name. |
| email | Required, valid format | Please enter your email address. |
| phone | Required (digits, 10 to 15 chars suggested) | Please enter your phone number. |
| dateOfBirth | Required, valid date in the past | Please enter your date of birth. |
| address | Required | Please enter your address. |
| department | Required, one of CSE / ECE / IT | Please select a department. |
| marks | Required number, 0 to 100 | Marks must be between 0 and 100. |
| document | Required; PDF, JPG, JPEG, PNG only; max 5 MB | Please upload your marksheet. |

### 5.2 Backend behavior
- Invalid request: HTTP `400` with `{ "success": false, "message": "Invalid application data" }`. Include a field-level `errors` array where useful.
- If validation fails after Multer has saved a file, **delete the orphaned file** from `uploads/`.
- Multer `fileFilter` rejects unsupported types; a file-size limit is set in the Multer config.
- Do not expose stack traces or internal error details to clients.

---

## 6. Data Model

**Collection:** `applications` (Mongoose model `Application`)

| Field | Type | Notes |
|---|---|---|
| name | String | required, trimmed |
| email | String | required, lowercase, trimmed |
| phone | String | required |
| dateOfBirth | Date | required |
| department | String | required, enum |
| marks | Number | required, min 0, max 100 |
| address | String | required |
| documentName | String | original filename, e.g. `marksheet.pdf` |
| documentPath | String | e.g. `/uploads/1727600000000-marksheet.pdf` |
| status | String | enum: Submitted, Review, Selected, Rejected; default `Submitted` |
| createdAt | Date | default `Date.now` (or `timestamps: true`) |

---

## 7. API Specification

Base URL: `http://localhost:5000`

### POST `/api/applications`
- Content-Type: `multipart/form-data`
- Fields: `name, email, phone, dateOfBirth, department, marks, address, document`
- Pipeline: Multer → validation → Mongoose → MongoDB
- `201`:
```json
{ "success": true, "message": "Application submitted successfully", "applicationId": "..." }
```
- `400`: invalid data, missing file, unsupported file type or size

### GET `/api/applications`
- `200`: `{ "success": true, "data": [ ...applications ] }`, newest first

### GET `/api/applications/:id`
- `200`: `{ "success": true, "data": { ... } }`
- `400` invalid ID format, `404` not found

### PUT `/api/applications/:id/status`
- Body: `{ "status": "Review" }`
- `200`: updated application
- `400`: status not in Submitted / Review / Selected / Rejected
- `404`: application not found

### Static: `GET /uploads/<filename>`
Serves the stored document.

### Error format (all endpoints)
```json
{ "success": false, "message": "Human-readable message" }
```
`500` for unexpected errors, with a generic message only.

---

## 8. Frontend Structure

**Routes**

| Path | Component | View |
|---|---|---|
| `/` | admission-form | Apply |
| `/admin` | application-list | Admin Applications |
| `/admin/:id` | application-details | Application Details |

**Files**
- `services/application.service.ts`: `submitApplication()`, `getApplications()`, `getApplication()`, `updateStatus()`. Components never call HttpClient directly.
- `models/application.ts`: TypeScript interface matching the API.
- `components/navbar`: "Online Admission System" with links **Apply** and **Admin**.

**UI:** clean, simple, professional, responsive, plain CSS, clear labels and messages, no heavy animation.

---

## 9. Project Structure

```text
mean-admission-poc/
├── frontend/admission-app/
│   └── src/app/{components/{navbar,admission-form,application-list,application-details},services,models}
├── backend/
│   ├── models/Application.js
│   ├── routes/applicationRoutes.js
│   ├── controllers/applicationController.js
│   ├── middleware/upload.js
│   ├── uploads/.gitkeep
│   ├── server.js
│   ├── .env            (not committed)
│   ├── .env.example
│   └── package.json
├── README.md
└── .gitignore
```

A simpler structure is acceptable if it adds no unnecessary architectural layers.

---

## 10. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Configuration | `PORT` and `MONGODB_URI` in `.env`; commit `.env.example` only; no hardcoded credentials |
| Security | CORS enabled for the Angular dev origin; sanitized filenames; MIME type and extension checks; no internal errors leaked |
| Reliability | Server logs and handles MongoDB connection failure; frontend shows "server unavailable" |
| Code quality | Meaningful names, small functions, comments only where useful, no duplication, no unused dependencies |
| Explainability | Each phase ends with a brief explanation of the code and key lines |
| Git | Ignore `node_modules/`, `.env`, `uploads/*`; keep `uploads/.gitkeep` |

**Commit history (suggested):** Initial MEAN project setup → Add MongoDB application model → Add Multer document upload → Add admission API → Add Angular admission form → Add admin application dashboard → Add status management → Add validation and error handling → Add README.

---

## 11. Test Plan

| # | Test | Expected result |
|---|---|---|
| 1 | Form loads | All fields and the submit button render |
| 2 | Required-field validation | Messages shown, no request sent |
| 3 | Invalid email | Rejected on frontend and backend |
| 4 | Invalid marks (<0 or >100) | Rejected |
| 5 | Unsupported file type | Rejected |
| 6 | Valid submission | Success screen with Application ID |
| 7 | File saved | File present in `backend/uploads/` |
| 8 | Data in MongoDB | Document has applicant fields |
| 9 | Document reference | `documentName` and `documentPath` stored |
| 10 | Admin list | Applications displayed |
| 11 | Search | Name and email filtering works |
| 12 | Department filter | Works |
| 13 | Status filter | Works |
| 14 | Status update | Persists; invalid status rejected with 400 |
| 15 | View document | Opens in browser |
| 16 | Persistence | Data still present after refresh |

---

## 12. Acceptance Criteria (End-to-End Flow)

1. User opens the Angular app.
2. User fills the admission form and selects a marksheet.
3. Angular sends `multipart/form-data`.
4. Express receives it; Multer saves the document.
5. Backend validates the data.
6. Mongoose creates the MongoDB document (applicant data and document reference).
7. Express returns a success response; Angular shows the Application ID.
8. Admin opens the list, sees the application, and can search and filter.
9. Admin views the uploaded document and updates the status.
10. After a refresh, all data persists.

All of this must work locally.

---

## 13. Implementation Plan (Phased)

Each phase ends with: run it, check for errors, explain what was built, and do not proceed while it is broken.

| Phase | Work |
|---|---|
| 1 | Project structure and backend skeleton |
| 2 | MongoDB connection |
| 3 | `Application` model |
| 4 | Multer middleware |
| 5 | POST application API |
| 6 | Test POST API (Postman / curl) |
| 7 | GET APIs and status update API |
| 8 | Create Angular app, routing, navbar |
| 9 | Admission form component |
| 10 | Connect form to backend via service |
| 11 | Admin application list |
| 12 | Search, filter, status update |
| 13 | Document viewing |
| 14 | Full request-response flow test |
| 15 | README and cleanup |

**Agent working rules:** inspect the workspace first and report what exists; never delete user files without confirmation; do not add technologies outside this PRD without explaining why; keep it viva-friendly.

---

## 14. Deliverables

1. Complete working MEAN source code.
2. Root `README.md`: overview, features, stack, architecture diagram, structure, prerequisites (Node.js, Angular CLI, MongoDB), exact install commands, backend and frontend setup, MongoDB setup, environment variables, API endpoints, how to run, testing, screenshots, future improvements.
3. 1 to 2 page write-up: objective, MEAN architecture, selected module, design decisions, validation, file upload approach, MongoDB design, limitations, future improvements.
4. Demo-ready local application.

### Architecture (for README)

```text
            Angular Frontend
                  | HTTP
                  v
           Express / Node.js
             /           \
         Multer        Mongoose
            |              |
     Local uploads/     MongoDB
```

---

## 15. Assumptions, Risks, and Limitations

**Assumptions**
- Departments are a fixed list: CSE, ECE, IT.
- One document per application.
- Local MongoDB or Atlas free tier is available.

**Risks and mitigations**

| Risk | Mitigation |
|---|---|
| Orphaned files after failed validation | Delete the uploaded file on any failure after Multer runs |
| Filename collisions or unsafe names | Timestamp prefix and sanitized original name |
| CORS errors between ports 4200 and 5000 | Configure `cors` for the Angular origin |
| Large uploads | Multer size limit (5 MB) |

**Known limitations (state in write-up)**
- No authentication; the admin page is public.
- Local filesystem storage only; uploads are not durable across hosts.
- Client-side filtering does not scale to large datasets.
- No pagination, duplicate-application detection, or notifications.

**Future improvements:** admin authentication (JWT), server-side search and pagination, cloud storage, email notifications, multiple documents, automated tests.
