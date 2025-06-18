document.addEventListener('DOMContentLoaded', function() {
    if (typeof statsData !== 'undefined') {
        initCharts();
        setupFilterEvents();
        updateAccordionCounts(); // Add this line
        displayActiveFilters();
        
        // Auto-expand if filters are active
        const filters = statsData.current_filters || {};
        if (filters.age?.length) document.querySelector('#ageFilter').classList.add('show');
        if (filters.gender?.length) document.querySelector('#genderFilter').classList.add('show');
        if (filters.orientation?.length) document.querySelector('#orientationFilter').classList.add('show');
    }
});

function updateAccordionCounts() {
    const filters = statsData.current_filters || {};
    
    // Update age filter count
    const ageCount = filters.age?.length || 0;
    document.querySelector('[data-bs-target="#ageFilter"]')
        .setAttribute('data-count', ageCount);
    
    // Update gender filter count
    const genderCount = filters.gender?.length || 0;
    document.querySelector('[data-bs-target="#genderFilter"]')
        .setAttribute('data-count', genderCount);
    
    // Update orientation filter count
    const orientationCount = filters.orientation?.length || 0;
    document.querySelector('[data-bs-target="#orientationFilter"]')
        .setAttribute('data-count', orientationCount);
}

// Initialize all charts
function initCharts() {
    // Destroy existing charts if they exist
    ['knowledgeChart', 'prideDayChart', 'freedomZegamaChart', 'discriminationChart'].forEach(id => {
        const chart = Chart.getChart(id);
        if (chart) chart.destroy();
    });

    // Create charts only if data exists
    if (statsData.knowledge && Object.keys(statsData.knowledge).length > 0) {
        createChart('knowledgeChart', 'pie', 'Badakizu zer esan nahi duten LGBTQI+ siglek?', statsData.knowledge);
    }
    
    if (statsData.proud_day && Object.keys(statsData.proud_day).length > 0) {
        createChart('prideDayChart', 'pie', 'Ekainak 28 ezagutza', statsData.proud_day);
    }
    
    if (statsData.freedom_zegama && Object.keys(statsData.freedom_zegama).length > 0) {
        createChart('freedomZegamaChart', 'bar', 'Zure ustez, Zegaman norbaitek askatasun osoz bizi al dezake bere orientazioa edo identitatea?', statsData.freedom_zegama);
    }
    
    if (statsData.discrimination_experience && Object.keys(statsData.discrimination_experience).length > 0) {
        createChart('discriminationChart', 'bar', 'Diskriminazio esperientziak', statsData.discrimination_experience);
    }
}

// Create individual chart
function createChart(canvasId, type, title, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const labels = Object.keys(data);
    const values = Object.values(data);

    const backgroundColors = labels.map((_, i) => `hsl(${i * 360 / labels.length}, 70%, 60%)`);

    const config = {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: getChartOptions(title, type)
    };

    new Chart(ctx, config);
}

// Get chart options based on type
function getChartOptions(title, type) {
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: title,
                font: { size: 16 }
            },
            legend: {
                position: type === 'pie' ? 'right' : 'top'
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.raw;
                        const percentage = Math.round((value / total) * 100);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (type === 'bar') {
        options.scales = {
            y: {
                beginAtZero: true,
                ticks: { precision: 0 }
            }
        };
    }

    return options;
}

// Set up filter form events
function setupFilterEvents() {
    const form = document.getElementById('filterForm');
    if (!form) return;

    // Elimina el submit automático al cambiar checkboxes
    form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Muestra feedback visual
            checkbox.parentElement.classList.toggle('filter-active', checkbox.checked);
        });
    });

    form.addEventListener('submit', function(e) {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) {
            btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kargatzen...`;
            btn.disabled = true;
        }
    });
}

// Display active filters
function displayActiveFilters() {
    const filters = statsData.current_filters || {};
    const activeFilters = [];
    
    if (filters.age && filters.age.length > 0) {
        activeFilters.push(`Adinak: ${filters.age.join(', ')}`);
    }
    if (filters.gender && filters.gender.length > 0) {
        activeFilters.push(`Generoak: ${filters.gender.join(', ')}`);
    }
    if (filters.orientation && filters.orientation.length > 0) {
        activeFilters.push(`Orientazioak: ${filters.orientation.join(', ')}`);
    }
    
    
}