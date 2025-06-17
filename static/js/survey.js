// Survey form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    
    if (form) {
        // Add form validation
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });

        // Add progress tracking
        trackProgress();
        
        // Add smooth scrolling for better UX
        addSmoothScrolling();
    }
});

function validateForm() {
    const requiredFields = [
        'age_group',
        'gender_identity', 
        'sexual_orientation'
    ];
    
    let isValid = true;
    const errors = [];
    
    // Check required fields
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`input[name="${fieldName}"]:checked`);
        if (!field) {
            isValid = false;
            errors.push(`Please select your ${fieldName.replace('_', ' ')}`);
        }
    });
    
    // Show errors if any
    if (!isValid) {
        showValidationErrors(errors);
    }
    
    return isValid;
}

function showValidationErrors(errors) {
    // Remove existing error alerts
    const existingAlerts = document.querySelectorAll('.validation-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new error alert
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show validation-alert" role="alert">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Please correct the following errors:</strong>
            <ul class="mb-0 mt-2">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Insert at top of form
    const form = document.getElementById('surveyForm');
    form.insertAdjacentHTML('afterbegin', alertHtml);
    
    // Scroll to top of form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function trackProgress() {
    const sections = ['Demographics', 'Community Experiences', 'Specific Concerns'];
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let completedFields = 0;
    
    // Create progress indicator
    const progressHtml = `
        <div class="progress mb-4" style="height: 8px;">
            <div id="formProgress" class="progress-bar bg-warning" role="progressbar" 
                 style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            </div>
        </div>
        <div class="text-center mb-4">
            <small class="text-muted">
                <span id="progressText">0% Complete</span>
            </small>
        </div>
    `;
    
    const form = document.getElementById('surveyForm');
    const cardBody = form.querySelector('.card-body');
    cardBody.insertAdjacentHTML('afterbegin', progressHtml);
    
    // Update progress when fields change
    requiredFields.forEach(field => {
        field.addEventListener('change', updateProgress);
    });
    
    function updateProgress() {
        completedFields = 0;
        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const group = document.querySelector(`input[name="${field.name}"]:checked`);
                if (group) completedFields++;
            } else if (field.value.trim() !== '') {
                completedFields++;
            }
        });
        
        const progress = Math.round((completedFields / requiredFields.length) * 100);
        const progressBar = document.getElementById('formProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressBar && progressText) {
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
            progressText.textContent = progress + '% Complete';
        }
    }
}

function addSmoothScrolling() {
    // Add smooth scrolling between form sections
    const sectionHeaders = document.querySelectorAll('h4');
    
    sectionHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Add character counter for textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.querySelector('textarea[name="additional_comments"]');
    
    if (textarea) {
        const maxLength = 1000;
        textarea.setAttribute('maxlength', maxLength);
        
        // Create character counter
        const counterHtml = `
            <div class="text-muted small mt-1">
                <span id="charCount">0</span> / ${maxLength} characters
            </div>
        `;
        
        textarea.insertAdjacentHTML('afterend', counterHtml);
        
        const charCount = document.getElementById('charCount');
        
        textarea.addEventListener('input', function() {
            const remaining = this.value.length;
            charCount.textContent = remaining;
            
            if (remaining > maxLength * 0.9) {
                charCount.parentElement.classList.add('text-warning');
            } else {
                charCount.parentElement.classList.remove('text-warning');
            }
        });
    }
});

// Add form auto-save functionality (optional)
function enableAutoSave() {
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);
    
    // Save to localStorage every 30 seconds
    setInterval(() => {
        const currentData = new FormData(form);
        const dataObj = {};
        
        for (let [key, value] of currentData.entries()) {
            dataObj[key] = value;
        }
        
        localStorage.setItem('survey_draft', JSON.stringify(dataObj));
    }, 30000);
    
    // Load saved data on page load
    const savedData = localStorage.getItem('survey_draft');
    if (savedData) {
        try {
            const dataObj = JSON.parse(savedData);
            Object.keys(dataObj).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'radio') {
                        const radioButton = form.querySelector(`[name="${key}"][value="${dataObj[key]}"]`);
                        if (radioButton) radioButton.checked = true;
                    } else {
                        field.value = dataObj[key];
                    }
                }
            });
        } catch (e) {
            console.warn('Could not load saved form data:', e);
        }
    }
}

// Clear auto-save data when form is submitted successfully
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the results page (meaning form was submitted)
    if (window.location.pathname.includes('results')) {
        localStorage.removeItem('survey_draft');
    }
});
