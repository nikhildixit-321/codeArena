#!/bin/bash

echo "🚀 Starting CodeArena Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
cd ..

# 3. Setup Frontend
echo "🏗️ Building Frontend..."
cd frontend
npm install
npm run build

# 4. Move to Nginx directory
echo "🚚 Moving build files to Nginx web root..."
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# 5. Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment Successful!"
