// Charts and data visualization for survey results
let chartInstances = {};

document.addEventListener('DOMContentLoaded', function() {
    loadResults();
});

async function loadResults() {
    try {
        showLoading();
        const response = await fetch('/api/statistics');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (data.total_responses === 0) {
            showNoData();
        } else {
            showResults(data);
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showError(error.message);
    }
}

function showLoading() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('noDataState').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
}

function showNoData() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('noDataState').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';
}

function showResults(data) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('noDataState').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    
    updateStatistics(data);
    createCharts(data);
    generateInsights(data);
}

function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('noDataState').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    
    const errorHtml = `
        <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h4>Error Loading Results</h4>
            <p>${message}</p>
            <button onclick="loadResults()" class="btn btn-outline-danger">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
    `;
    
    document.querySelector('.container').insertAdjacentHTML('beforeend', errorHtml);
}

function updateStatistics(data) {
    document.getElementById('totalResponses').textContent = data.total_responses;
    document.getElementById('ageGroups').textContent = Object.keys(data.age_groups).length;
    document.getElementById('genderIdentities').textContent = Object.keys(data.gender_identity).length;
    document.getElementById('orientations').textContent = Object.keys(data.sexual_orientation).length;
}

function createCharts(data) {
    // Destroy existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};
    
    // Color schemes
    const prideColors = [
        '#e74c3c', '#f39c12', '#f1c40f', 
        '#27ae60', '#3498db', '#9b59b6'
    ];
    
    const safetyColors = [
        '#27ae60', '#2ecc71', '#f39c12', '#e67e22', '#e74c3c'
    ];
    
    // Age Groups Chart
    chartInstances.age = createPieChart('ageChart', 'Age Distribution', data.age_groups, prideColors);
    
    // Gender Identity Chart
    chartInstances.gender = createPieChart('genderChart', 'Gender Identity', data.gender_identity, prideColors);
    
    // Sexual Orientation Chart
    chartInstances.orientation = createBarChart('orientationChart', 'Sexual Orientation', data.sexual_orientation, prideColors);
    
    // Community Safety Chart
    chartInstances.safety = createBarChart('safetyChart', 'Community Safety Perception', data.community_safety, safetyColors);
    
    // Discrimination Experience Chart
    chartInstances.discrimination = createPieChart('discriminationChart', 'Discrimination Experience', data.discrimination_experience, ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#95a5a6']);
    
    // Support Services Chart
    chartInstances.services = createBarChart('servicesChart', 'Most Needed Support Services', data.support_services, prideColors);
    
    // Community Acceptance Chart
    chartInstances.acceptance = createBarChart('acceptanceChart', 'Community Acceptance Rating', data.community_acceptance, safetyColors);
    
    // Healthcare Access Chart
    chartInstances.healthcare = createBarChart('healthcareChart', 'Healthcare Access Rating', data.healthcare_access, safetyColors);
}

function createPieChart(canvasId, title, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0) {
        showEmptyChart(ctx, title);
        return null;
    }
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createBarChart(canvasId, title, data, colors) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    if (labels.length === 0) {
        showEmptyChart(ctx, title);
        return null;
    }
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Responses',
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: colors.slice(0, labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                            return `${context.parsed.y} responses (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

function showEmptyChart(ctx, title) {
    ctx.style.display = 'none';
    const parent = ctx.parentElement;
    parent.innerHTML = `
        <div class="text-center text-muted py-4">
            <i class="fas fa-chart-bar fa-3x mb-3"></i>
            <h6>${title}</h6>
            <p>No data available</p>
        </div>
    `;
}

function generateInsights(data) {
    const insights = [];
    const actions = [];
    
    // Analyze safety perception
    const safetyData = data.community_safety;
    const unsafeResponses = (safetyData['Somewhat unsafe'] || 0) + (safetyData['Very unsafe'] || 0);
    const totalSafetyResponses = Object.values(safetyData).reduce((a, b) => a + b, 0);
    
    if (totalSafetyResponses > 0) {
        const unsafePercentage = (unsafeResponses / totalSafetyResponses * 100).toFixed(1);
        if (unsafePercentage > 30) {
            insights.push(`${unsafePercentage}% of respondents feel unsafe being open about their LGBTQI+ identity in the community.`);
            actions.push('Implement community safety initiatives and anti-discrimination policies.');
        }
    }
    
    // Analyze discrimination
    const discriminationData = data.discrimination_experience;
    const experiencedDiscrimination = (discriminationData['Yes, frequently'] || 0) + 
                                    (discriminationData['Yes, occasionally'] || 0) + 
                                    (discriminationData['Yes, rarely'] || 0);
    const totalDiscriminationResponses = Object.values(discriminationData).reduce((a, b) => a + b, 0);
    
    if (totalDiscriminationResponses > 0) {
        const discriminationPercentage = (experiencedDiscrimination / totalDiscriminationResponses * 100).toFixed(1);
        if (discriminationPercentage > 20) {
            insights.push(`${discriminationPercentage}% of respondents have experienced discrimination based on their LGBTQI+ identity.`);
            actions.push('Develop discrimination reporting mechanisms and support services.');
        }
    }
    
    // Analyze most needed services
    const servicesData = data.support_services;
    const topService = Object.keys(servicesData).reduce((a, b) => servicesData[a] > servicesData[b] ? a : b, '');
    if (topService) {
        insights.push(`"${topService}" is the most requested support service by the community.`);
        actions.push(`Prioritize development of ${topService.toLowerCase()} programs.`);
    }
    
    // Analyze healthcare access
    const healthcareData = data.healthcare_access;
    const poorHealthcare = (healthcareData['Poor'] || 0) + (healthcareData['Very poor'] || 0);
    const totalHealthcareResponses = Object.values(healthcareData).reduce((a, b) => a + b, 0);
    
    if (totalHealthcareResponses > 0) {
        const poorHealthcarePercentage = (poorHealthcare / totalHealthcareResponses * 100).toFixed(1);
        if (poorHealthcarePercentage > 25) {
            insights.push(`${poorHealthcarePercentage}% of respondents rate LGBTQI+-affirming healthcare access as poor or very poor.`);
            actions.push('Partner with healthcare providers to improve LGBTQI+ cultural competency training.');
        }
    }
    
    // Update insights section
    const insightsHtml = insights.length > 0 ? 
        insights.map(insight => `<div class="alert alert-info"><i class="fas fa-info-circle"></i> ${insight}</div>`).join('') :
        '<div class="alert alert-secondary"><i class="fas fa-chart-line"></i> Collect more responses to generate meaningful insights.</div>';
    
    document.getElementById('keyInsights').innerHTML = insightsHtml;
    
    // Update action items section
    const actionsHtml = actions.length > 0 ?
        '<ul class="list-group list-group-flush">' + 
        actions.map(action => `<li class="list-group-item"><i class="fas fa-arrow-right text-warning"></i> ${action}</li>`).join('') + 
        '</ul>' :
        '<div class="alert alert-secondary"><i class="fas fa-tasks"></i> Action items will be generated as more survey data becomes available.</div>';
    
    document.getElementById('actionItems').innerHTML = actionsHtml;
}

// Export data functionality
function exportData() {
    fetch('/api/statistics')
        .then(response => response.json())
        .then(data => {
            const csvContent = generateCSV(data);
            downloadCSV(csvContent, 'lgbtqi_survey_results.csv');
        })
        .catch(error => {
            console.error('Error exporting data:', error);
            alert('Error exporting data. Please try again.');
        });
}

function generateCSV(data) {
    let csv = 'Category,Response,Count,Percentage\n';
    
    Object.keys(data).forEach(category => {
        if (typeof data[category] === 'object' && data[category] !== null) {
            const total = Object.values(data[category]).reduce((a, b) => a + b, 0);
            Object.keys(data[category]).forEach(response => {
                const count = data[category][response];
                const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
                csv += `"${category}","${response}",${count},${percentage}%\n`;
            });
        }
    });
    
    return csv;
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Add export button to results page
document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.querySelector('button[onclick="loadResults()"]');
    if (refreshButton) {
        const exportButton = document.createElement('button');
        exportButton.className = 'btn btn-outline-info ms-2';
        exportButton.innerHTML = '<i class="fas fa-download"></i> Export Data';
        exportButton.onclick = exportData;
        refreshButton.parentNode.insertBefore(exportButton, refreshButton.nextSibling);
    }
});
