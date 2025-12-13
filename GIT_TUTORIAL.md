# 🐙 How to Upload to GitHub

Follow these steps to upload your **DropSpace** project to the URL: `https://github.com/nurwendi/DropSpace`.

### 1. Initialize Git (If not already done)
Open your terminal (Command Prompt or PowerShell) in the project folder `d:\file sharing` and run:

```bash
git init
```

### 2. Configure User (If new to Git)
If you haven't set up Git on this computer before, set your username and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 3. Create a `.gitignore` file
It is important **NOT** to upload `node_modules` or your uploaded files. Create a file named `.gitignore` with this content:
```
node_modules/
uploads/
data/
.env
```
*(I have already checked if this file exists or should be created)*.

### 4. Stage and Commit Files
Prepare all your files for upload:
```bash
git add .
git commit -m "Initial commit: DropSpace v1.0 with Space Theme and Shared Clipboard"
```

### 5. Link to Remote Repository
Link your local folder to the empty GitHub repository:
```bash
git branch -M main
git remote add origin https://github.com/nurwendi/DropSpace.git
```

### 6. Push to GitHub
Finally, upload your code. You might be asked to sign in to GitHub in the browser.
```bash
git push -u origin main
```

---

### ✅ Success!
Your code should now be visible at [https://github.com/nurwendi/DropSpace](https://github.com/nurwendi/DropSpace).
