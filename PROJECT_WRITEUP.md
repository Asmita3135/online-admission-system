# Online Admission System — Project Write-Up

## 1. Introduction
This project presents an Online Admission System proof-of-concept (POC) developed using the MEAN Stack (MongoDB, Express.js, Angular, and Node.js). The application demonstrates the full request-response lifecycle between a modern single-page Angular frontend and a RESTful Express backend, with a special focus on handling multipart document uploads (marksheets) and managing applications through an administrative dashboard.

## 2. Problem Statement
Manual admission processes in educational institutions often suffer from physical paperwork overhead, missing documents, lack of centralized tracking, and delays in application status reviews. A web-based admission system streamlines this process by enabling applicants to submit forms and documents digitally while providing administrators with immediate access to filter, review, and update application statuses.

## 3. Objective
The primary objective of this project is to build a lightweight, working POC of an Online Admission System that demonstrates:
1. Client-side form validation and file inspection using Angular Reactive Forms.
2. Asynchronous binary file upload (`multipart/form-data`) using `FormData` and Multer.
3. Database persistence of applicant data and document file path references in MongoDB via Mongoose.
4. An admin dashboard with real-time client-side search, department/status filtering, document inspection, and status management.

## 4. Technologies Used
- **MongoDB:** NoSQL document database for storing application records.
- **Express.js:** Lightweight web application framework for Node.js handling RESTful APIs and static file routing.
- **Angular (v22):** TypeScript-based frontend framework providing component-based architecture, Reactive Forms, and HttpClient.
- **Node.js:** Asynchronous JavaScript runtime environment.
- **Mongoose:** Object Data Modeling (ODM) library for MongoDB validation and queries.
- **Multer:** Node.js middleware for handling multipart file uploads.

## 5. System Architecture
The system follows a standard 3-tier MEAN architecture:

$$\text{Angular Frontend} \xrightarrow[\text{HttpClient}]{\text{HTTP / FormData}} \text{Express Backend} \xrightarrow[\text{Multer}]{\text{Disk Storage}} \text{backend/uploads/}$$
$$\text{Express Backend} \xrightarrow[\text{Mongoose}]{\text{BSON Query}} \text{MongoDB Database}$$

1. **Presentation Layer (Angular):** Contains components for navigation (`NavbarComponent`), admission form submission (`AdmissionFormComponent`), application listings (`ApplicationListComponent`), and single application details (`ApplicationDetailsComponent`).
2. **Application Layer (Node/Express):** Exposes REST API endpoints (`/api/applications`), handles CORS, processes file upload middleware, validates payloads, and serves static upload assets (`/uploads`).
3. **Data Layer (MongoDB):** Persists application fields and document file references.

## 6. Document Upload Feature
When an applicant submits their marksheet:
1. Angular inspects the selected file to verify format (PDF/JPG/PNG) and size ($\le 5\text{ MB}$).
2. The file is appended to a `FormData` object under key `document` and POSTed to Express.
3. Multer saves the physical file to `backend/uploads/` using a unique timestamp prefix (e.g., `1727600000000-marksheet.pdf`) and path traversal sanitization.
4. Mongoose stores only the original filename (`documentName`) and relative server path (`documentPath`) inside MongoDB.
5. If validation or database insertion fails, an orphan cleanup helper (`deleteFile`) immediately unlinks the uploaded file from disk.

## 7. Database Design
The application utilizes a single MongoDB collection named `applications` defined by Mongoose schema `Application`:
- `name` (String, required)
- `email` (String, required, lowercase)
- `phone` (String, required)
- `dateOfBirth` (Date, required)
- `department` (String, required, Enum: CSE, ECE, IT)
- `marks` (Number, required, Min 0, Max 100)
- `address` (String, required)
- `documentName` (String, required)
- `documentPath` (String, required)
- `status` (String, Enum: Submitted, Review, Selected, Rejected, Default: Submitted)
- `createdAt` / `updatedAt` (Date, automatic timestamps)

## 8. API Design
- `GET /api/health` — System health check.
- `POST /api/applications` — Receives `multipart/form-data`, validates input, stores document, creates database record (`201 Created`).
- `GET /api/applications` — Retrieves all application records sorted newest first.
- `GET /api/applications/:id` — Retrieves details of a single application by 24-character ObjectId.
- `PUT /api/applications/:id/status` — Updates application status (`Submitted`, `Review`, `Selected`, `Rejected`).
- `GET /uploads/<filename>` — Express static route serving uploaded marksheet files.

## 9. Frontend and Admin Dashboard
- **Admission Form (`/`):** Built with Angular Reactive Forms, providing real-time feedback and clear error indicators.
- **Admin Dashboard (`/admin`):** Displays all applications in a responsive HTML table. Features real-time client-side search by name/email, department filtering, status filtering, and result count tracking.
- **Details & Review View (`/admin/:id`):** Displays complete applicant information, a **View Marksheet** button that opens the document in a new browser tab (`target="_blank"`), and a status dropdown with an **Update Status** button.

## 10. Validation and Error Handling
Validation is strictly enforced on both tiers:
- **Client-Side:** Reactive Forms validate required fields, email format, 10–15 digit phone regex, past date of birth, 0–100 marks, file extensions (PDF/JPG/PNG), and 5 MB file size limit before network transmission.
- **Server-Side:** Express controller re-validates all fields. Multer filter rejects unsupported MIME types and oversized files.
- **Error Handling:** Database offline state (`ECONNREFUSED`) or invalid ObjectId format (HTTP 400) are caught gracefully, displaying human-readable alert boxes without crashing the UI or leaking internal stack traces.

## 11. Testing
The implementation underwent thorough testing:
- **Build Verification:** `npx ng build` passed with zero compilation errors.
- **API Unit & Route Testing:** All REST endpoints verified with `curl` and Node.js test scripts.
- **Orphan Cleanup:** Verified that failed validations or database errors automatically delete temporary uploaded files from `backend/uploads/`.
- **Database Offline Testing:** Handled offline MongoDB daemon state cleanly across all system layers.

## 12. Limitations
- **No Authentication:** Admin routes are open for demonstration purposes.
- **Local Storage:** Files are stored on the local filesystem rather than cloud storage.
- **Client-Side Filtering:** Filtering is performed in browser memory, suitable for POC scale.

## 13. Conclusion
The Online Admission System successfully demonstrates a functional, full-stack MEAN architecture. By enforcing dual-layer validation, secure file handling, orphan file cleanup, and a responsive admin dashboard, the system provides a robust foundation for academic admission management.
