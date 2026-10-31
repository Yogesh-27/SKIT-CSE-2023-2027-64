# 🚀 How to Run CivicSolve (No Docker Needed)

## One-Time Setup (Already Done ✅)
- Node.js installed ✅
- MongoDB installed & running as Windows service ✅  
- `server/node_modules` installed ✅
- `client/node_modules` installed ✅
- `server/.env` created ✅
- Database seeded with 19 sample issues ✅

---

## Every Day — Start the Project

### Step 1: Open VS Code
Open the folder: `C:\Users\user\Downloads\SKIT-CSE-2023-2027-64`

### Step 2: Open Terminal 1 — Start the API Server
```powershell
cd server
npm run dev
```
You should see:
```
MongoDB connected
✅ CivicSolve API running on http://localhost:5000
```

### Step 3: Open Terminal 2 — Start the Frontend
```powershell
cd client
npm run dev
```
You should see:
```
VITE ready at http://localhost:5173
```

### Step 4: Open your browser
Go to: **http://localhost:5173**

---

## If You Need to Reset Sample Data
```powershell
cd server
node seed.js
```

---

## GitHub — Who Pushed the Code?
✅ **YES — it was pushed using your GitHub account (Yogesh-27)**  
The Windows Credential Manager had your GitHub login saved (`git:https://github.com`).  
All commits go to: https://github.com/Yogesh-27/SKIT-CSE-2023-2027-64

