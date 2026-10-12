@echo off
cd /d C:\Users\dell\Desktop\KaJob_final_year_project\KaJob-final-year-project\backend
call venv\Scripts\activate.bat
python manage.py auto_confirm_jobs >> auto_confirm.log 2>&1