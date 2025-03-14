#!/bin/bash

set -e

echo "Starting React frontend..."

cd frontend
npm install
npm run dev
