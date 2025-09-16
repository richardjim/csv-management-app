# CSV Data Management Web Application

A full-stack Node.js + React application for uploading, viewing, editing, validating, and exporting CSV files with data integrity validation.

## Features

- **File Upload**: Upload two CSV files (strings and classifications) with flexible naming
- **Interactive Editing**: Edit data directly in tables with add/delete row functionality
- **Data Validation**: Real-time validation ensuring data integrity between files
- **Export Functionality**: Download updated CSV files locally
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages and validation feedback
- **Docker Support**: Containerized deployment ready

## Tech Stack

### Frontend
- React 18 with functional components and hooks
- Modern CSS with responsive design
- Axios for API communication
- Jest and React Testing Library for testing

### Backend
- Node.js with Express
- Multer for file upload handling
- csv-parser and fast-csv for CSV processing
- Comprehensive validation system
- Jest for testing

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/richardjim/csv-management-app.git
cd csv-management-app
