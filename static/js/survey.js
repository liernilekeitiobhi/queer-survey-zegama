// Survey form validation and enhancement
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    
    if (form) {
        // Add form validation
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            form.classList.add('was-validated');
            return true;
        });

        // Add progress tracking
        trackProgress();
        
        // Add smooth scrolling for better UX
        addSmoothScrolling();
        
        // Add character counter for textarea
        setupCharacterCounter();
    }
});

function validateForm() {
    const requiredFields = [
        'age_group',
        'gender_identity', 
        'sexual_orientation',
        'knowledge',
        'proud-day',
        'culture-participation',
        'secure-spaces',
        'colective-thinking'
    ];
    
    const requiredSelects = [
        'ally',
        'freedom-zegama',
        'freedom-euskal-herria',
        'discrimination-experience',
        'homofobic-language',
        'homofobic-language2',
        'homofobic-language3',
        'homofobic-language4'
    ];
    
    let isValid = true;
    const errors = [];
    
    // Check required radio buttons
    requiredFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"]:checked`);
        if (!field) {
            const label = document.querySelector(`label[for="${fieldName}"]`);
            const fieldLabel = label ? label.textContent.replace('*', '').trim() : fieldName.replace('_', ' ');
            errors.push(`Mesedez, bete "${fieldLabel}" eremua`);
            isValid = false;
        }
    });
    
    // Check required selects
    requiredSelects.forEach(selectName => {
        const select = document.querySelector(`select[name="${selectName}"]`);
        if (select && select.value === "") {
            const label = select.previousElementSibling;
            const fieldLabel = label ? label.textContent.replace('*', '').trim() : selectName.replace('-', ' ');
            errors.push(`Mesedez, aukeratu "${fieldLabel}" eremurako`);
            isValid = false;
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
            <strong>Mesedez, zuzendu ondoko erroreak:</strong>
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
    const allFields = [
        // Radio buttons
        ...document.querySelectorAll('input[type="radio"]'),
        // Selects
        ...document.querySelectorAll('select'),
        // Textarea
        document.querySelector('textarea[name="additional_comments"]')
    ].filter(Boolean);

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
    allFields.forEach(field => {
        field.addEventListener('change', updateProgress);
        if (field.tagName === 'TEXTAREA') {
            field.addEventListener('input', updateProgress);
        }
    });
    
    function updateProgress() {
        let completedFields = 0;
        
        // Check radio groups
        const radioGroups = new Set(
            Array.from(document.querySelectorAll('input[type="radio"]'))
                .map(radio => radio.name)
        );
        
        radioGroups.forEach(groupName => {
            if (document.querySelector(`input[name="${groupName}"]:checked`)) {
                completedFields++;
            }
        });
        
        // Check selects
        document.querySelectorAll('select').forEach(select => {
            if (select.value !== "") {
                completedFields++;
            }
        });
        
        // Check textarea (optional)
        const textarea = document.querySelector('textarea[name="additional_comments"]');
        if (textarea && textarea.value.trim() !== '') {
            completedFields++;
        }
        
        const totalFields = radioGroups.size + document.querySelectorAll('select').length + 1;
        const progress = Math.round((completedFields / totalFields) * 100);
        const progressBar = document.getElementById('formProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressBar && progressText) {
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', progress);
            progressText.textContent = progress + '% Complete';
        }
    }
    
    // Initial update
    updateProgress();
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

function setupCharacterCounter() {
    const textarea = document.querySelector('textarea[name="additional_comments"]');
    
    if (textarea) {
        const maxLength = 1000;
        textarea.setAttribute('maxlength', maxLength);
        
        // Create character counter
        const counterHtml = `
            <div class="text-muted small mt-1">
                <span id="charCount">0</span> / ${maxLength} karaktere
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
}

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                // Show loading state
                const submitButton = form.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bidaltzen...';
                submitButton.disabled = true;
                
                // Submit form data
                fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok');
                })
                .then(data => {
                    if (data.status === 'success') {
                        window.location.href = "{{ url_for('results') }}";
                    } else {
                        throw new Error('Error saving response');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showValidationErrors(['Errorea gertatu da erantzunak bidaltzean. Mesedez, saiatu berriro.']);
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                });
            }
        });
    }
});