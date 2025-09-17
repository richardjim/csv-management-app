# CSV Data Management Web Application

A full-stack Node.js + React application for uploading, viewing, editing, validating, and exporting CSV files with data integrity validation.

## Features

* **File Upload**: Upload two CSV files (strings and classifications) with flexible naming
* **Interactive Editing**: Edit data directly in tables with add/delete row functionality
* **Data Validation**: Real-time validation ensuring data integrity between files
* **Export Functionality**: Download updated CSV files locally
* **Responsive Design**: Works on desktop and mobile devices
* **Error Handling**: Clear error messages and validation feedback
* **Docker Support**: Containerized deployment ready

---

## Tech Stack

### Frontend

* React 18 with functional components and hooks
* Modern CSS with responsive design
* Axios for API communication
* Jest and React Testing Library for testing

### Backend

* Node.js with Express
* Multer for file upload handling
* csv-parser and fast-csv for CSV processing
* Comprehensive validation system
* Jest for testing

---

## Quick Start

### Prerequisites

* Node.js 18+
* npm or yarn
* Docker (optional)

### Repository layout (example)

```
csv-management-app/
├─ backend-api/        # Express API (server)
├─ frontend/           # React app (client)
└─ README.md
```

---

## Setup & Local Run Instructions

> These instructions assume the repository has two folders: `backend-api` and `frontend`. Adjust paths if your structure differs.

### 1. Clone the repo

```bash
git clone https://github.com/richardjim/csv-management-app.git
cd csv-management-app
```

### 2. Backend (API)

```bash
cd backend-api
# install dependencies
npm install

# create environment file (if needed)
# cp .env.example .env

# start in development mode
npm run dev

# or start production mode
npm start
```

The backend will default to `http://localhost:3000` (or the port defined in your .env).

### 3. Frontend (React)

Open a new terminal tab/window:

```bash
cd frontend
npm install
npm start
```

By default the React app runs at `http://localhost:3001` (or `3000` if not used) — check `package.json` or `.env` for `PORT` overrides.

---

## Build & Run Docker Image

> The repo includes a Dockerfile for the backend and/or frontend. These commands show typical steps for building and running containers locally.

### Backend Docker (example)

```bash
# from repository root
cd backend-api
# build image (tag it)
docker build -t csv-management-backend:latest .

# run container (map port 3000)
docker run -it --rm -p 3000:3000 --name csv-backend csv-management-backend:latest
```

### Frontend Docker (example)

```bash
cd frontend
# build static bundle
npm run build

# build an image that serves the build (if Dockerfile exists)
docker build -t csv-management-frontend:latest .

# run container (map port 80)
docker run -it --rm -p 8080:80 --name csv-frontend csv-management-frontend:latest
```

> If you want both running and communicating locally, make sure the frontend is configured to point to the backend URL (e.g. `REACT_APP_API_BASE_URL=http://localhost:3000`) before building.

---

## Running Tests

### Backend tests

```bash
cd backend-api
npm test
```

### Frontend tests

```bash
cd frontend
npm test
```

Tests use Jest and React Testing Library (frontend) and Jest (backend). See each package `package.json` for specific test scripts.

---

## Simple User Guide (Upload → Edit → Validate → Export)

1. **Open the App**

   * Frontend: `http://localhost:3001` (or the port your dev server uses)

2. **Upload files**

   * Use the UI to upload **two CSV files**: one for *strings* and one for *classifications*.
   * The app accepts CSVs with headers. After uploading you should see parsed data displayed in editable tables.

3. **Edit records**

   * Click table cells to edit values.
   * Add or remove rows with the provided controls.
   * Edits are applied client-side; use the app controls to save or stage changes.

4. **Validate data**

   * Click the `Validate` button to compare the *strings* dataset against the *classifications* dataset.
   * Validation results appear as row-level error messages indicating invalid Topic/Subtopic/Industry combinations.

5. **Fix errors**

   * Edit rows flagged by validation or update classification rows so combinations match.

6. **Export**

   * Once validation passes (or you’re satisfied with edits), export the dataset using the `Export` button.
   * The app will download a CSV file (strings or classifications) with your current edits.

---

## Deployment

A deployed instance is available at:

[https://csv-management-app-o679.onrender.com/](https://csv-management-app-o679.onrender.com/)

To deploy yourself, use services like Render, Heroku, Vercel (frontend), or Docker-based platforms. Ensure environment variables (ports, CORS origins, etc.) are configured correctly.

---

## License

MIT
