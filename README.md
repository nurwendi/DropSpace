# 🚀 Self-Hosted File Sharing System

A simple, secure, and modern file sharing application built with Node.js. Features a beautiful "Space Theme" UI, drag-and-drop uploads, shared clipboard, and more.

**GitHub Repository**: [https://github.com/nurwendi/DropSpace](https://github.com/nurwendi/DropSpace)

## ✨ Features

- **📂 File Management**: Upload, list, download, and delete files.
- **📋 Shared Clipboard**: Sync text notes across devices with a multiple-clipboard history.
- **🌌 Space Theme**: Dynamic particle/starfield background with glassmorphism UI.
- **🚀 Fast Uploads**: Real-time speed indicator and visual progress bar (with flying plane animation!).
- **🔒 Secure**: Session-based login protection (Default: `admin` / `admin`).
- **📱 Responsive**: Works perfectly on Desktop and Mobile.

## 🛠️ Prerequisites

- **Node.js**: Version 14.x or higher.
- **NPM**: Comes with Node.js.

---

## 🐧 Linux Installation Guide

Follow these steps to deploy on a Linux server (Ubuntu/Debian recommended).

### 1. Install Node.js & Git
If you haven't installed Node.js or Git yet:
```bash
# Update package list
sudo apt update

# Install Node.js (via NodeSource for latest versions) and Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify installation
node -v
git --version
```

### 2. Clone from GitHub
Download the source code directly from the repository:
```bash
# Navigate to your desired folder (e.g., /opt)
cd /opt

# Clone the repository
sudo git clone https://github.com/nurwendi/DropSpace.git

# Enter the project directory
cd DropSpace
```

### 3. Install Dependencies
Run the following command to install required packages (`express`, `multer`, etc.):
```bash
npm install
```

### 4. Configure Port (Optional)
By default, the app runs on port **3010**. You can change this in `server.js` file if needed.
```javascript
const PORT = 3010; // Change this value
```

### 5. Run the Application
You can run it temporarily for testing:
```bash
npm start
```

### 6. Run in Background (Production with PM2)
For a production server, use **PM2** to keep the app running in the background and restart automatically on reboot.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start server.js --name "file-sharing"

# Save the process list to restart on reboot
pm2 save
pm2 startup
```

The application is now running at `http://YOUR_SERVER_IP:3010`.

---

## 🔑 Login Credentials

The default login is:
- **Username**: `admin`
- **Password**: `admin`

*Note: For better security, open `server.js` and change `ADMIN_USERNAME` and `ADMIN_PASSWORD` consts.*

## 🤝 Contributing
Feel free to modify the `public/` folder to customize the UI!

---
© 2025 Self-Hosted Node Project
