import os
import json
import gspread
from google.oauth2.service_account import Credentials
import logging

logger = logging.getLogger(__name__)

class GoogleSheetsManager:
    def __init__(self):
        self.client = None
        self.worksheet = None
        self.setup_credentials()
    
    def setup_credentials(self):
        """Setup Google Sheets credentials from environment variables"""
        try:
            # Get credentials from environment variable
            creds_json = os.environ.get('GOOGLE_CREDENTIALS')
            if creds_json:
                creds_dict = json.loads(creds_json)
                scope = [
                    'https://spreadsheets.google.com/feeds',
                    'https://www.googleapis.com/auth/drive'
                ]
                credentials = Credentials.from_service_account_info(creds_dict, scopes=scope)
                self.client = gspread.authorize(credentials)
                logger.info("Google Sheets credentials configured successfully")
            else:
                logger.warning("GOOGLE_CREDENTIALS not found in environment variables")
        except Exception as e:
            logger.error(f"Error setting up Google Sheets credentials: {e}")
    
    def get_or_create_worksheet(self, spreadsheet_name="LGBTQI+ Community Survey"):
        """Get or create the survey worksheet"""
        try:
            if not self.client:
                logger.error("Google Sheets client not initialized")
                return None
            
            # Try to open existing spreadsheet
            try:
                spreadsheet = self.client.open(spreadsheet_name)
                logger.info(f"Opened existing spreadsheet: {spreadsheet_name}")
            except gspread.SpreadsheetNotFound:
                # Create new spreadsheet
                spreadsheet = self.client.create(spreadsheet_name)
                logger.info(f"Created new spreadsheet: {spreadsheet_name}")
            
            # Get or create the main worksheet
            try:
                worksheet = spreadsheet.worksheet("Survey Responses")
            except gspread.WorksheetNotFound:
                worksheet = spreadsheet.add_worksheet("Survey Responses", 1000, 20)
                # Add headers
                headers = [
                    "Timestamp", "Age Group", "Gender Identity", "Sexual Orientation",
                    "Relationship Status", "Community Safety", "Discrimination Experience",
                    "Support Services Needed", "Community Acceptance", "Employment Concerns",
                    "Healthcare Access", "Housing Concerns", "Additional Comments"
                ]
                worksheet.append_row(headers)
                logger.info("Created worksheet with headers")
            
            self.worksheet = worksheet
            return worksheet
        except Exception as e:
            logger.error(f"Error getting/creating worksheet: {e}")
            return None
    
    def save_survey_response(self, response_data):
        """Save survey response to Google Sheets"""
        try:
            if not self.worksheet:
                self.get_or_create_worksheet()
            
            if not self.worksheet:
                logger.error("Could not initialize worksheet")
                return False
            
            # Prepare row data
            from datetime import datetime
            row_data = [
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                response_data.get('age_group', ''),
                response_data.get('gender_identity', ''),
                response_data.get('sexual_orientation', ''),
                response_data.get('relationship_status', ''),
                response_data.get('community_safety', ''),
                response_data.get('discrimination_experience', ''),
                response_data.get('support_services', ''),
                response_data.get('community_acceptance', ''),
                response_data.get('employment_concerns', ''),
                response_data.get('healthcare_access', ''),
                response_data.get('housing_concerns', ''),
                response_data.get('additional_comments', '')
            ]
            
            self.worksheet.append_row(row_data)
            logger.info("Survey response saved successfully")
            return True
        except Exception as e:
            logger.error(f"Error saving survey response: {e}")
            return False
    
    def get_survey_statistics(self):
        """Get statistics from survey responses for visualization"""
        try:
            if not self.worksheet:
                self.get_or_create_worksheet()
            
            if not self.worksheet:
                logger.error("Could not initialize worksheet")
                return {}
            
            # Get all records except header
            records = self.worksheet.get_all_records()
            
            if not records:
                return {
                    'total_responses': 0,
                    'age_groups': {},
                    'gender_identity': {},
                    'sexual_orientation': {},
                    'community_safety': {},
                    'discrimination_experience': {},
                    'support_services': {},
                    'community_acceptance': {},
                    'employment_concerns': {},
                    'healthcare_access': {},
                    'housing_concerns': {}
                }
            
            stats = {
                'total_responses': len(records),
                'age_groups': {},
                'gender_identity': {},
                'sexual_orientation': {},
                'community_safety': {},
                'discrimination_experience': {},
                'support_services': {},
                'community_acceptance': {},
                'employment_concerns': {},
                'healthcare_access': {},
                'housing_concerns': {}
            }
            
            # Count responses for each category
            for record in records:
                for field in ['age_groups', 'gender_identity', 'sexual_orientation', 
                             'community_safety', 'discrimination_experience', 'support_services',
                             'community_acceptance', 'employment_concerns', 'healthcare_access', 'housing_concerns']:
                    field_key = field.replace('_', ' ').title().replace(' ', '_')
                    if field_key in record:
                        value = record[field_key]
                        if value:
                            stats[field][value] = stats[field].get(value, 0) + 1
            
            logger.info("Survey statistics calculated successfully")
            return stats
        except Exception as e:
            logger.error(f"Error getting survey statistics: {e}")
            return {}

# Create global instance
sheets_manager = GoogleSheetsManager()
