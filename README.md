# MunchMate: CS 348 Group 17 Project

## Prerequisites

Ensure you have the following installed:

- Python 3.11+
- pip
- Node.js (v22+)
- npm

## Setup

1. Clone the Repository

   ```bash
   git clone https://github.com/aaryanshroff/cs348-group-project
   cd cs348-group-project
   ```

2. Run the Setup Script

    ```bash
    # MacOS / Linux
    ./scripts/bash/setup.sh
    ```

    ```powershell
    # Windows
    # Set $env:VAR beforehand as needed
    .\scripts\powershell\setup.ps1
    ```

## Running the Application

### Sample DB

```bash
cd scripts/bash
./run_backend.sh
```
Open a new terminal and run:
```bash
cd backend/databases/sample_db
sqlite3 sample_dataset.db < ../../sql/test-sample.sql > ../../sql/test-sample.out
```

### Backend
Open a new terminal and run:
```bash
# MacOS / Linux
./scripts/bash/run_backend.sh
```

```powershell
# Windows
.\scripts\powershell\run_backend.ps1
```

### Frontend
Open a new terminal and run:
```bash
# MacOS / Linux
./scripts/bash/run_frontend.sh
```

```powershell
# Windows
.\scripts\powershell\run_frontend.ps1
```

## Supported Features

### Basic Features

- **R7 - List all restaurants**
