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

There are 2 environment variables used in setting up the database:

DB_TYPE: 
    desc:        use production database or sample?
    valid input: { "sample", "prod" }
    defaults:    "sample"
REINIT_DB:
    desc:        if database exists, should it be reinitialized?
    valid input: Boolean
    defaults:    "false"

Set these values through the following in terminal:
```
export DB_TYPE=prod
export REINIT_DB=true
```

Set these BEFORE running the run_backend script to choose between
production and sample data.

## Backend
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

### Testing database queries
NOTE: Must run run_backend script BEFORE this section.

Open a new terminal and run:
```bash
cd backend/databases/{sample|prod}_db
sqlite3 {sample|prod}_dataset.db < ../../sql/test-{sample|prod}.sql > ../../sql/test-{sample|prod}.out
```

## Supported Features

### Basic Features

- **R7 - List all restaurants**
