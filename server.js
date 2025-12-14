const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3010;

// Admin Credentials (HARDCODED FOR SIMPLICITY)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // Change this!

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'supersecretkey', // Change this in production
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication Middleware
const requireAuth = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        if (req.path === '/') {
            return res.redirect('/login.html');
        }
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

// Public Routes
app.use(express.static('public')); // Serve frontend files

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// Protect file operations
app.use('/upload', requireAuth);
// We might want to protect listing too
// app.use('/files', requireAuth); 

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Unique naming to prevent overwrite
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes

// Upload File
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// List Files (Protected)
app.get('/files', requireAuth, (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');

    fs.readdir(directoryPath, (err, files) => {
        // ... (rest of the code)
        if (err) {
            // If directory doesn't exist, return empty list
            if (err.code === 'ENOENT') {
                return res.json([]);
            }
            return res.status(500).json({ error: 'Unable to scan files' });
        }

        const fileInfos = files.map(file => {
            try {
                const stats = fs.statSync(path.join(directoryPath, file));
                return {
                    name: file,
                    size: stats.size,
                    createdAt: stats.birthtime
                };
            } catch (e) {
                console.error(`Error stat-ing file ${file}:`, e);
                return null;
            }
        }).filter(file => file !== null);

        // Sort by newest first
        fileInfos.sort((a, b) => b.createdAt - a.createdAt);

        res.json(fileInfos);
    });
});

// Download File
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Delete File (Protected)
app.delete('/delete/:filename', requireAuth, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            res.json({ message: 'File deleted successfully' });
        } catch (err) {
            console.error('Error deleting file:', err);
            res.status(500).json({ error: 'Error deleting file' });
        }
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Shared Notes / Clipboard
const NOTES_FILE = path.join(__dirname, 'data', 'notes.txt');

// Ensure data dir exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Multiple Clipboard / Notes
const CLIPBOARD_FILE = path.join(__dirname, 'data', 'clipboard.json');

// Ensure data dir exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper to read/write clipboard
function getClipboard() {
    if (!fs.existsSync(CLIPBOARD_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(CLIPBOARD_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveClipboard(data) {
    fs.writeFileSync(CLIPBOARD_FILE, JSON.stringify(data, null, 2));
}

app.get('/notes', requireAuth, (req, res) => {
    try {
        res.json(getClipboard());
    } catch (e) {
        console.error('Error getting notes:', e);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
});

app.post('/notes', requireAuth, (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    try {
        const clips = getClipboard();
        const newClip = {
            id: Date.now().toString(), // Simple ID
            content,
            createdAt: Date.now()
        };

        // Add to top
        clips.unshift(newClip);
        saveClipboard(clips);

        res.json(newClip);
    } catch (e) {
        console.error('Error saving note:', e);
        res.status(500).json({ error: 'Failed to save note' });
    }
});

app.delete('/notes/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    try {
        let clips = getClipboard();
        clips = clips.filter(c => c.id !== id);
        saveClipboard(clips);
        res.json({ success: true });
    } catch (e) {
        console.error('Error deleting note:', e);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
