# CampusNest — Hyperlocal Rental Platform Near College

CampusNest is a full-stack web application designed to connect student tenants and landlords in college areas. This platform uses a **React + Bootstrap** frontend, a **Python + Flask** backend, and a **MongoDB** database.

---

## 🛠 Prerequisites

Before starting, make sure you have the following installed on your machine:
1. **Node.js** (v18 or higher) & **npm**
2. **Python** (v3.8 or higher) & **pip**
3. **MongoDB** (Local Community Edition or a MongoDB Atlas account)

---

## 🚀 Setup & Startup Guide

Follow these steps in your terminal to connect the database and run the application.

### 1. Database Connection (MongoDB)

#### Option A: Running MongoDB Locally (Recommended)
1. Start your local MongoDB service:
   - **Windows (Command Prompt / Powershell)**:
     ```bash
     net start MongoDB
     # Or run mongod directly if not registered as a service:
     mongod --dbpath "C:\data\db"
     ```
   - **Mac (Homebrew)**:
     ```bash
     brew services start mongodb-community
     ```
   - **Linux**:
     ```bash
     sudo systemctl start mongod
     ```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Cluster.
2. Create a Database User and obtain your Connection String (e.g., `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/campusnest?retryWrites=true&w=majority`).
3. Update your backend environment variables (see below).

---

### 2. Run the Backend Server (Python + Flask)

Open a **new terminal window** and navigate to the `backend` folder:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a Python virtual environment (venv)
python -m venv venv

# 3. Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (Command Prompt):
.\venv\Scripts\activate.bat
# On macOS / Linux:
source venv/bin/activate

# 4. Install backend dependencies
pip install -r requirements.txt

# 5. Configure environment variables (Optional)
# Open `backend/.env` file. By default, it is configured with:
# MONGO_URI=mongodb://localhost:27017/campusnest
# JWT_SECRET=supersecretjwtkeycampusnest123
# Change MONGO_URI if using MongoDB Atlas.

# 6. Run the Flask server
python app.py
```

The Flask backend should now be running at **`http://localhost:5000`**. You can verify it by opening `http://localhost:5000/api/health` in your browser.

---

### 3. Run the Frontend App (React + Vite)

Open **another terminal window** and navigate to the root directory (`NEW AIRBNB`):

```bash
# 1. Install frontend dependencies (if not already done)
npm install

# 2. Run the Vite development server
npm run dev
```

The React frontend should now be running at **`http://localhost:5173`**. Vite is configured to proxy all `/api/*` traffic automatically to the Flask backend on port `5000`.

---

## 🔄 Walkthrough of the User Flow

To test the application:

1. **Open the App**: Go to `http://localhost:5173`. You will see the CampusNest landing page.
2. **Register a Landlord Account**:
   - Click **Sign Up** -> Select **Register As: Landlord** -> Fill out details -> Submit.
3. **Upload Properties**:
   - Log in using your landlord credentials.
   - Go to your **Dashboard**.
   - Fill out the **List New Property** form (Title, Rent, Distance, Type, Amenities, Image) and click **Publish Listing**. Add 2 or 3 properties to test.
4. **Register a Tenant / Student Account**:
   - Log out from the landlord account.
   - Click **Sign Up** -> Select **Register As: Tenant** -> Fill out details -> Submit.
5. **Explore & Search Listings**:
   - Log in using your tenant credentials.
   - Go to **Browse Properties** page.
   - Search by keyword or adjust the rent/distance sliders.
6. **Save & Compare**:
   - On the Listings page, click the **Heart** icon to save properties. You can view them in your **Dashboard**.
   - Check the **Compare** icon on up to 3 listings.
   - Go to the **Compare** page from the sidebar to view them side-by-side. The lowest rent, highest rating, and shortest distance will be highlighted automatically in green!
7. **Detailed View & Landlord Contact**:
   - Click **View Details** on any listing to see descriptions, amenities, and click **Send Inquiry** to email the owner.

---

## 📁 File Structure

```
NEW AIRBNB/
├── backend/
│   ├── .env                 # Backend environment config
│   ├── app.py               # Flask REST API endpoints
│   └── requirements.txt     # Python backend dependencies
├── src/
│   ├── components/
│   │   └── Navbar.jsx       # Global navigation component
│   ├── context/
│   │   └── AuthContext.jsx  # Frontend auth state context
│   ├── pages/
│   │   ├── Auth.jsx         # Login & Sign Up page
│   │   ├── Compare.jsx      # Side-by-side comparison page
│   │   ├── Dashboard.jsx    # Landlord/Tenant dashboard
│   │   ├── Home.jsx         # Landing page
│   │   ├── Listings.jsx     # Property board with filters
│   │   └── PropertyDetails.jsx # Detail template and landlord contact
│   ├── App.jsx              # Client router configurations
│   ├── main.jsx             # Main app entry
│   └── index.css            # Styles & custom micro-animations
├── package.json             # Node package manifest
├── vite.config.js           # Vite dev configuration (proxy rule)
└── README.md                # This instructions document
```
