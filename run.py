"""
Doraemon AI Study World — Main Application Launcher
Runs the full-stack application and opens your browser.
"""
import sys
import os
import subprocess
import webbrowser
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=" * 65)
    print("  🎒 DOREMON'S LEARNING WORLD — AI-Powered Learning Platform")
    print("=" * 65)
    print("\nStarting the server at http://127.0.0.1:8000 ...")

    # Check python venv
    venv_python = os.path.join(os.path.dirname(__file__), "backend", "venv", "Scripts", "python.exe")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable

    # Command to run uvicorn
    cmd = [python_exe, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]

    print("\n✨ Ready to learn! Opening your browser...")
    try:
        # Schedule browser opening after a slight delay
        import threading
        def open_browser():
            time.sleep(1.8)
            webbrowser.open("http://127.0.0.1:8000")
        threading.Thread(target=open_browser, daemon=True).start()

        # Run Uvicorn
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nServer stopped. See you next study session! 🌟")

if __name__ == "__main__":
    main()
