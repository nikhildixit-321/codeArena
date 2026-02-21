---
description: Steps to deploy CodeArena to AWS EC2
---

# CodeArena AWS Deployment Guide

This workflow guides you through deploying both the backend and frontend to an AWS EC2 instance using Nginx and PM2.

### 1. Backend Preparation
// turbo
- Make sure `.env` has production values:
  - `MONGO_URI=your_atlas_uri`
  - `SESSION_SECRET=your_secret`
  - `BACKEND_URL=http://your_ec2_ip_or_domain:5000`
  - `FRONTEND_URL=http://your_domain.com`

### 2. Frontend Preparation
// turbo
- Run `npm run build` in the frontend directory.
- Ensure `VITE_API_URL` points to your backend production URL.

### 3. AWS EC2 Setup (Manual Steps in AWS Console)
- Launch an EC2 Instance (Ubuntu 22.04 LTS).
- Open Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend).

### 4. Server Setup (Run via SSH)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone Repo
git clone <your-repo-url>
cd codeGame

# Setup Backend
cd backend
npm install
pm2 start index.js --name "codegame-backend"

# Setup Frontend Nginx
sudo apt install nginx -y
# Copy build files to /var/www/html
```

### 5. Nginx Configuration
- Configure Nginx to proxy `/api` and `/socket.io` to the backend.
- Serve the frontend `dist` folder as the root.
