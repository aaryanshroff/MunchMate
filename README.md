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

Set these values however you'd like through the following commands in a terminal:
```bash
# MacOS / Linux
export DB_TYPE=prod
export REINIT_DB=true
```

```powershell
# Windows
$env:DB_TYPE="prod"
$env:REINIT_DB="true"
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

- **R6 - Add Restaurants and Reviews**
    - Frontend:
        - frontend/src/AddRestaurantPage.jsx
        - frontend/src/RestaurantPage.jsx
        - frontend/src/ReviewsList.jsx
    - Backend Endpoints / SQL Queries:
        - backend/app.py
        - backend/queries/add_restaurant.sql
        - backend/queries/add_restaurant_images.sql
        - backend/queries/assign_restaurant_types.sql
        - backend/queries/get_restaurant_details.sql
        - backend/queries/get_restaurant_reviews.sql
        - backend/queries/get_my_review.sql
        - backend/queries/upsert_review.sql

- **R7 - List all restaurants**
    - Frontend:
        - frontend/src/Restaurants.jsx
    - Backend Endpoints / SQL Queries:
        - backend/app.py
        - backend/queries/list_restaurants.sql
        - backend/queries/list_cities.sql
        - backend/queries/list_types.sql
        - backend/queries/filter_restaurants.sql

- **R8 - Average review of a restaurant**
    - Frontend:
        - frontend/src/RestaurantPage.jsx
    - Backend Endpoints / SQL Query:
        - backend/app.py
        - backend/queries/get_average_reviews.sql

- **R9 - Login Functionality**
    - Frontend:
        - frontend/src/Register.jsx
        - frontend/src/Login.jsx
    - Backend Endpoints / SQL Queries:
        - backend/app.py
        - backend/queries/login.sql
        - backend/queries/add_login_attempt.sql
        - backend/queries/create_account.sql
        - backend/queries/get_account_lockout.sql

- **R10 - User Profile & Follow Functionality**
    - Frontend:
        - frontend/src/UserProfile.jsx
        - frontend/src/UserSearchPage.jsx
        - frontend/src/FollowButton.jsx
    - Backend Endpoints / SQL Query:
        - backend/app.py
        - backend/queries/search_users.sql
        - backend/queries/remove_follow.sql
        - backend/queries/add_follow.sql
        - backend/queries/list_my_reviews.sql
        - backend/queries/list_following.sql
        - backend/queries/list_following_reviews.sql
        - backend/queries/list_followers.sql
        - backend/queries/get_user_profile.sql

### Advanced Features

