# Chronic Kidney Disease Prediction

## Start all services on Windows

From the project root (`D:\chronic_kidney_disease`), make sure MongoDB is running and configure the environment files:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Set `JWT_SECRET` and confirm `MONGO_URI` in `backend\.env`. Then open three PowerShell terminals and run these commands.

### Terminal 1: FastAPI ML service

```powershell
Set-Location D:\chronic_kidney_disease
.\ml\.venv\Scripts\Activate.ps1
python -m uvicorn ml.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Express backend

```powershell
Set-Location D:\chronic_kidney_disease\backend
npm run dev
```

### Terminal 3: React frontend

```powershell
Set-Location D:\chronic_kidney_disease\frontend
npm run dev
```

The services will be available at:

- FastAPI: `http://127.0.0.1:8000`
- Express: `http://localhost:5000`
- React/Vite: `http://localhost:5173`

The backend calls the ML service through `ML_SERVICE_URL`, which should be set to `http://127.0.0.1:8000` in `backend\.env`.
