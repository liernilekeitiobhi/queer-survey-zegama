from flask import render_template, request, jsonify, redirect, url_for, flash
from app import app
import logging

import gspread
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env file



# Get Sheet ID from .env
SHEET_ID = os.getenv("SHEET_ID")

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
    try:
        creds_path = "temp_credentials.json"
        with open(creds_path, "w") as f:
            f.write(os.environ["GOOGLE_CREDS"])
        gc = gspread.service_account(filename=creds_path)
        sheet = gc.open_by_key(SHEET_ID).sheet1
        records = sheet.get_all_records()
        
        # Get unique values for filters
        age_groups = sorted(set(str(r['ADINA']) for r in records if r.get('ADINA')))
        genders = sorted(set(str(r['GENERO_IDENTITATEA']) for r in records if r.get('GENERO_IDENTITATEA')))
        orientations = sorted(set(str(r['SEXU_ORIENTAZIOA']) for r in records if r.get('SEXU_ORIENTAZIOA')))
        
        # Get multiple filter parameters
        age_filters = request.args.getlist('age')
        gender_filters = request.args.getlist('gender')
        orientation_filters = request.args.getlist('orientation')
        
        # Filter records
        filtered_records = records
        if age_filters:
            filtered_records = [r for r in filtered_records if str(r.get('ADINA')) in age_filters]
        if gender_filters:
            filtered_records = [r for r in filtered_records if str(r.get('GENERO_IDENTITATEA')) in gender_filters]
        if orientation_filters:
            filtered_records = [r for r in filtered_records if str(r.get('SEXU_ORIENTAZIOA')) in orientation_filters]
        
        stats = calculate_statistics(filtered_records)
        
        return render_template('results.html', 
                           stats=stats,
                           age_groups=age_groups,
                           genders=genders,
                           orientations=orientations,
                           current_filters={
                               'age': age_filters,
                               'gender': gender_filters,
                               'orientation': orientation_filters
                           })
    except Exception as e:
        logger.error(f"Error in results: {str(e)}")
        flash('Errorea gertatu da emaitzak kargatzean', 'error')
        return redirect(url_for('index'))

def calculate_statistics(records):
    """Calculate statistics from filtered records using the actual column names"""
    stats = {
        'total_responses': len(records),
        'knowledge': {},                  # SIGLEN_EZAGUTZA
        'proud_day': {},                   # EKAINAK_28_EZAGUTZA
        'culture_participation': {},       # PARTEHARTZEA
        'ally': {},                        # ALIATUA
        'freedom_zegama': {},              # ASKATASUNA_ZEGAMAN
        'freedom_euskal_herria': {},       # ASKATASUNA_EUSKAL_HERRIAN
        'discrimination_experience': {},   # DISKRIMINAZIO_ESPERIENTZIAK
        'homofobic_language': {},          # HIZKUNTZA_HOMOFOBOA_1
        'homofobic_language2': {},         # HIZKUNTZA_HOMOFOBOA_2
        'homofobic_language3': {},         # HIZKUNTZA_HOMOFOBOA_3
        'homofobic_language4': {},         # HIZKUNTZA_HOMOFOBOA_4
        'secure_spaces': {},               # ESPAZIO_SEGURU_GEHIAGO
        'colective_thinking': {}           # SOLASALDIAN_PARTEHARTZEA
    }
    
    # Field mapping between code names and actual column names
    field_mapping = {
        'knowledge': 'SIGLEN_EZAGUTZA',
        'proud_day': 'EKAINAK_28_EZAGUTZA',
        'culture_participation': 'PARTEHARTZEA',
        'ally': 'ALIATUA',
        'freedom_zegama': 'ASKATASUNA_ZEGAMAN',
        'freedom_euskal_herria': 'ASKATASUNA_EUSKAL_HERRIAN',
        'discrimination_experience': 'DISKRIMINAZIO_ESPERIENTZIAK',
        'homofobic_language': 'HIZKUNTZA_HOMOFOBOA_1',
        'homofobic_language2': 'HIZKUNTZA_HOMOFOBOA_2',
        'homofobic_language3': 'HIZKUNTZA_HOMOFOBOA_3',
        'homofobic_language4': 'HIZKUNTZA_HOMOFOBOA_4',
        'secure_spaces': 'ESPAZIO_SEGURU_GEHIAGO',
        'colective_thinking': 'SOLASALDIAN_PARTEHARTZEA'
    }
    
    for record in records:
        for stat_field, sheet_column in field_mapping.items():
            if sheet_column in record:
                value = record[sheet_column]
                if value and str(value).strip():  # Only count non-empty values
                    stats[stat_field][value] = stats[stat_field].get(value, 0) + 1
    
    print("Calculated stats:", stats)  # Debug output
    return stats


def save_to_sheet(data):
    try:
        creds_path = "temp_credentials.json"
        with open(creds_path, "w") as f:
            f.write(os.environ["GOOGLE_CREDS"])

        gc = gspread.service_account(filename=creds_path)
        sheet = gc.open_by_key(SHEET_ID).sheet1
        # Add a timestamp and survey data
        row = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            data.get('age_group'),
            data.get('gender_identity'),
            data.get('sexual_orientation'),
            data.get('knowledge'),
            data.get('proud-day'),
            data.get('culture-participation'),
            data.get('ally'),
            data.get('freedom-zegama'),
            data.get('freedom-euskal-herria'),
            data.get('discrimination-experience'),
            data.get('homofobic-language'),
            data.get('homofobic-language2'),
            data.get('homofobic-language3'),
            data.get('homofobic-language4'),
            data.get('secure-spaces'),
            data.get('colective-thinking'),
            data.get('additional_comments')
        ]        
        sheet.append_row(row)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

@app.route('/submit', methods=['POST'])
def submit():
    data = request.form.to_dict()
    if save_to_sheet(data):
        return jsonify({"status": "success"})
    return jsonify({"status": "error"}), 500


if __name__ == '__main__':
    app.run(debug=True)


@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('index.html'), 500
