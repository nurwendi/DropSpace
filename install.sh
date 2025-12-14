#!/bin/bash

# DropSpace Auto-Installer for Ubuntu/Debian

# Colors
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting DropSpace Installation...${NC}"

# 1. Update System
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip

# 2. Install Node.js (v20)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone Repository
echo "Cloning repository..."
if [ -d "DropSpace" ]; then
    echo "Directory DropSpace already exists. Pulling latest changes..."
    cd DropSpace
    git pull
else
    git clone https://github.com/nurwendi/DropSpace.git
    cd DropSpace
fi

# 4. Install Dependencies
echo "Installing dependencies..."
npm install

# 5. Setup PM2 (Process Manager)
echo "Setting up PM2..."
sudo npm install -g pm2

# Stop existing instance if any
pm2 stop dropspace 2>/dev/null || true
pm2 delete dropspace 2>/dev/null || true

# Start server
pm2 start server.js --name dropspace

# Save PM2 list so it starts on reboot
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

# 6. Finalize
IP_ADDRESS=$(hostname -I | cut -d' ' -f1)
PORT=2000

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "DropSpace is running at: http://$IP_ADDRESS:$PORT"
echo -e "${GREEN}==========================================${NC}"
