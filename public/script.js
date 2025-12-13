const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const refreshBtn = document.getElementById('refresh-btn');
const uploadStatus = document.getElementById('upload-status');
const statusText = document.getElementById('status-text');
const speedText = document.getElementById('speed-text');
const progressFill = document.getElementById('progress-fill');
const cancelBtn = document.getElementById('cancel-btn');

let activeXhr = null;

// Drag & Drop Handlers
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        uploadFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        uploadFile(fileInput.files[0]);
    }
});

refreshBtn.addEventListener('click', loadFiles);

cancelBtn.addEventListener('click', () => {
    if (activeXhr) {
        activeXhr.abort();
        activeXhr = null;
        statusText.textContent = 'Upload Cancelled';
        speedText.textContent = '';
        progressFill.style.width = '0%';
        cancelBtn.classList.add('hidden');
        setTimeout(() => {
            uploadStatus.classList.add('hidden');
        }, 2000);
    }
});

// Upload Logic with Speed Indicator (XHR)
function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadStatus.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
    statusText.textContent = `Uploading ${file.name}...`;
    speedText.textContent = '0 MB/s';
    progressFill.style.width = '0%';

    const xhr = new XMLHttpRequest();
    activeXhr = xhr;

    const startTime = Date.now();
    let prevLoaded = 0;
    let prevTime = startTime;

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressFill.style.width = percentComplete + '%';

            // Calculate Speed
            const currentTime = Date.now();
            const timeDiff = (currentTime - prevTime) / 1000; // Seconds

            if (timeDiff >= 0.5) { // Update every 500ms
                const loadedDiff = e.loaded - prevLoaded; // Bytes
                const speed = loadedDiff / timeDiff; // Bytes per second
                speedText.textContent = formatSize(speed) + '/s';

                prevTime = currentTime;
                prevLoaded = e.loaded;
            }
        }
    };

    xhr.onload = () => {
        activeXhr = null;
        cancelBtn.classList.add('hidden');
        if (xhr.status === 200) {
            statusText.textContent = 'Upload Complete!';
            progressFill.style.width = '100%';
            speedText.textContent = '';
            setTimeout(() => {
                uploadStatus.classList.add('hidden');
                progressFill.style.width = '0%';
            }, 2000);
            loadFiles();
        } else if (xhr.status === 401) {
            window.location.href = '/login.html';
        } else {
            statusText.textContent = 'Upload Failed';
        }
    };

    xhr.onerror = () => {
        activeXhr = null;
        cancelBtn.classList.add('hidden');
        statusText.textContent = 'Network Error';
    };

    xhr.onabort = () => {
        activeXhr = null;
        cancelBtn.classList.add('hidden');
        statusText.textContent = 'Aborted';
    }

    xhr.open('POST', '/upload', true);
    xhr.send(formData);
}

// Load Files Logic
async function loadFiles() {
    try {
        const response = await fetch('/files');

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        const files = await response.json();

        fileList.innerHTML = '';

        if (files.length === 0) {
            fileList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No files yet</div>';
            return;
        }

        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';

            const sizeString = formatSize(file.size);

            item.innerHTML = `
                <div class="file-name">
                    <span class="file-icon">📄</span>
                    <span title="${file.name}">${file.name}</span>
                </div>
                <div class="file-size">${sizeString}</div>
                <div class="file-action">
                    <a href="/download/${file.name}" class="download-link" download>Download</a>
                    <button class="delete-btn" onclick="deleteFile('${file.name}')">Delete</button>
                </div>
            `;
            fileList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

async function deleteFile(filename) {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
        const response = await fetch(`/delete/${filename}`, {
            method: 'DELETE'
        });

        if (response.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (response.ok) {
            loadFiles();
        } else {
            alert('Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    }
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Multiple Clipboard Logic
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const notesList = document.getElementById('notes-list');

if (notesList) {
    loadNotes();

    addNoteBtn.addEventListener('click', addNote);

    // Allow Ctrl+Enter to add
    noteInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            addNote();
        }
    });
}

async function loadNotes() {
    try {
        const res = await fetch('/notes');
        if (res.status === 401) return;
        const notes = await res.json();
        renderNotes(notes);
    } catch (e) {
        console.error('Error loading notes:', e);
    }
}

async function addNote() {
    const content = noteInput.value.trim();
    if (!content) return;

    try {
        addNoteBtn.disabled = true;
        const res = await fetch('/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (res.ok) {
            noteInput.value = '';
            loadNotes();
        }
    } catch (e) {
        alert('Failed to add note');
    } finally {
        addNoteBtn.disabled = false;
    }
}

async function deleteNote(id) {
    if (!confirm('Start deletion?')) return;
    try {
        const res = await fetch(`/notes/${id}`, { method: 'DELETE' });
        if (res.ok) loadNotes();
    } catch (e) {
        console.error('Delete failed:', e);
    }
}

function copyNote(content) {
    navigator.clipboard.writeText(content).then(() => {
        // Could show a toast here
        const activeElement = document.activeElement;
        const originalText = activeElement.textContent;
        activeElement.textContent = 'Copied!';
        setTimeout(() => {
            activeElement.textContent = originalText;
        }, 1000);
    });
}

function renderNotes(notes) {
    notesList.innerHTML = '';

    if (notes.length === 0) {
        notesList.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 1rem;">No clips yet</div>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';

        // Escape HTML to prevent XSS
        const safeContent = note.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        card.innerHTML = `
            <div class="note-content">${safeContent}</div>
            <div class="note-actions">
                <button class="note-btn copy" onclick="copyNote(\`${safeContent.replace(/`/g, "\\`")}\`)">Copy</button>
                <button class="note-btn delete" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        `;
        notesList.appendChild(card);
    });
}

// Initial Load
loadFiles();
