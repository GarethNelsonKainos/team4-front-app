const form = document.getElementById('cvUploadForm');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const uploadBtn = document.getElementById('uploadBtn');

// Initialize upload button as disabled (no file selected yet)
uploadBtn.disabled = true;

console.log('Apply-job page initialized', {
    form: !!form,
    dropZone: !!dropZone,
    fileInput: !!fileInput,
    previewSection: !!previewSection,
    uploadBtn: !!uploadBtn
});

// File selection handler
function handleFileSelect(file) {
    console.log('File selected:', file.name, file.size);
    
    // Validate file size (5 MB = 5242880 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        console.error('File too large:', file.size);
        showMessage('errorMessage');
        document.getElementById('errorText').textContent = 'File size exceeds 5 MB limit. Please select a smaller file.';
        return;
    }
    
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (fileName && fileSize) {
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(2) + ' KB';
        previewSection.classList.remove('hidden');
        uploadBtn.disabled = false;
        hideMessages();
        console.log('Preview updated');
    } else {
        console.error('Preview elements not found');
    }
}

// Message display
function showMessage(type) {
    console.log('Showing message:', type);
    document.getElementById('errorMessage')?.classList.add('hidden');
    document.getElementById('successMessage')?.classList.add('hidden');
    document.getElementById('loadingState')?.classList.add('hidden');
    if (type) {
        const el = document.getElementById(type);
        if (el) el.classList.remove('hidden');
    }
}

// Drag and drop
dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('border-kainos-500', 'bg-kainos-50');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-kainos-500', 'bg-kainos-50');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('border-kainos-500', 'bg-kainos-50');
    if (e.dataTransfer.files?.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        
        // Update fileInput.files property with the dropped file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        fileInput.files = dataTransfer.files;
        
        // Validate and display the file
        handleFileSelect(droppedFile);
    }
});

// File input - trigger file dialog
const browseBtn = document.getElementById('browseBtn');

if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Browse button clicked, opening file dialog');
        fileInput.click();
    });
}

dropZone.addEventListener('click', (e) => {
    // Trigger unless clicking on specific elements to exclude
    const isClickable = e.target.tagName === 'A' || e.target.id === 'fileInput' || e.target.id === 'browseBtn';
    if (!isClickable) {
        console.log('Dropzone clicked, opening file dialog', e.target.tagName);
        fileInput.click();
    }
});

fileInput.addEventListener('change', e => {
    console.log('File input change event fired', {
        files: e.target.files ? e.target.files.length : 0,
        target: e.target
    });
    if (e.target.files && e.target.files.length > 0) {
        console.log('Processing file...');
        handleFileSelect(e.target.files[0]);
    } else {
        console.log('No files selected');
    }
});

// Remove file
const removeFileBtn = document.getElementById('removeFile');
if (removeFileBtn) {
    removeFileBtn.addEventListener('click', () => {
        console.log('Remove file clicked');
        fileInput.value = '';
        previewSection.classList.add('hidden');
        uploadBtn.disabled = true;
        hideMessages();
    });
}

// Form submission handler with AJAX
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitting via AJAX');
        
        // Validate file selection
        if (!fileInput.files || fileInput.files.length === 0) {
            console.error('No file selected');
            document.getElementById('errorText').textContent = 'Please select a file before submitting.';
            showMessage('errorMessage');
            return false;
        }
        
        // Show loading state and disable button
        showMessage('loadingState');
        uploadBtn.disabled = true;
        
        try {
            // Create FormData with the file
            const formData = new FormData();
            formData.append('cv', fileInput.files[0]);
            
            // Submit via AJAX
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });
            
            console.log('Response status:', response.status);
            
            // Handle response
            if (response.ok) {
                console.log('Application submitted successfully');
                window.location.href = '/application-success';
            } else {
                console.error('Application submission failed:', response.status);
                window.location.href = '/error';
            }
        } catch (error) {
            console.error('Network error during submission:', error);
            window.location.href = '/error';
        }
    });
}

// Helper
function hideMessages() {
    showMessage(null);
}
