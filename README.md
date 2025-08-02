# 🚀 CSV Field Matcher

A powerful React-based web application that allows you to upload CSV files, map fields intelligently, edit data in real-time, and send processed data to your backend API.

## ✨ Features

- 📊 **Dual CSV Upload**: Upload primary CSV (data to process) and reference CSV (field source)
- 🔄 **Smart Field Mapping**: Automatic field matching based on similarity algorithms
- ✏️ **Real-time Data Editing**: Edit CSV data directly in the browser table
- 👀 **JSON Preview**: Preview your data in JSON format before sending
- 🚀 **API Integration**: Send processed data to your backend with one click
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Loading States**: Visual feedback during API operations
- 🛡️ **Error Handling**: Comprehensive error management and user feedback

## 🎯 Use Cases

- **Data Migration**: Transform CSV data formats before importing to databases
- **API Data Preparation**: Convert CSV files to JSON for API consumption  
- **Field Standardization**: Map inconsistent field names to standard formats
- **Data Validation**: Preview and edit data before processing
- **Batch Processing**: Handle multiple records efficiently

## 🛠️ Technology Stack

- **Frontend**: React 18+ with Hooks
- **CSV Parsing**: PapaParse library
- **Styling**: CSS3 with modern flexbox/grid
- **API Communication**: Fetch API with async/await
- **State Management**: React useState hooks

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API server (Go)

### Project Setup

```bash
# Clone the repository
git clone https://github.com/ibrahimecer/csv_field_matcher.git

# Navigate to project directory
cd csv_field_matcher

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Navigate to backend directory
cd ..
cd backend

# Start backend API server
go run main.go
