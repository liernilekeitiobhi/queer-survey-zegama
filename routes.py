from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app
from google_sheets import sheets_manager
import logging

logger = logging.getLogger(__name__)

@app.route('/')
def index():
    """Main page with navigation to survey and info sections"""
    return render_template('index.html')

@app.route('/survey')
def survey():
    """Survey form page"""
    return render_template('survey.html')

@app.route('/info')
def info():
    """Information page about LGBTQI+ community resources"""
    return render_template('info.html')

@app.route('/results')
def results():
    """Results visualization page"""
    return render_template('results.html')

@app.route('/submit_survey', methods=['POST'])
def submit_survey():
    """Handle survey form submission"""
    try:
        # Get form data
        response_data = {
            'age_group': request.form.get('age_group'),
            'gender_identity': request.form.get('gender_identity'),
            'sexual_orientation': request.form.get('sexual_orientation'),
            'relationship_status': request.form.get('relationship_status'),
            'community_safety': request.form.get('community_safety'),
            'discrimination_experience': request.form.get('discrimination_experience'),
            'support_services': request.form.get('support_services'),
            'community_acceptance': request.form.get('community_acceptance'),
            'employment_concerns': request.form.get('employment_concerns'),
            'healthcare_access': request.form.get('healthcare_access'),
            'housing_concerns': request.form.get('housing_concerns'),
            'additional_comments': request.form.get('additional_comments')
        }
        
        # Validate required fields
        required_fields = ['age_group', 'gender_identity', 'sexual_orientation']
        for field in required_fields:
            if not response_data.get(field):
                flash(f'Please fill in the {field.replace("_", " ").title()} field.', 'error')
                return redirect(url_for('survey'))
        
        # Save to Google Sheets
        success = sheets_manager.save_survey_response(response_data)
        
        if success:
            flash('Thank you for your response! Your submission has been recorded.', 'success')
            return redirect(url_for('results'))
        else:
            flash('There was an error saving your response. Please try again.', 'error')
            return redirect(url_for('survey'))
            
    except Exception as e:
        logger.error(f"Error submitting survey: {e}")
        flash('An unexpected error occurred. Please try again.', 'error')
        return redirect(url_for('survey'))

@app.route('/api/statistics')
def api_statistics():
    """API endpoint to get survey statistics for charts"""
    try:
        stats = sheets_manager.get_survey_statistics()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        return jsonify({'error': 'Unable to fetch statistics'}), 500

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('index.html'), 500
