"""
Crop Recommendation System Launcher
Automatically starts the backend server and opens the frontend
"""

import subprocess
import webbrowser
import time
import os
import sys
import threading
import requests
from pathlib import Path

def check_server_running():
    """Check if the server is already running"""
    try:
        response = requests.get("http://127.0.0.1:5000/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def start_backend_server():
    """Start the Flask backend server"""
    print("🚀 Starting Crop Recommendation Backend Server...")
    
    # Check if server is already running
    if check_server_running():
        print("✅ Backend server is already running!")
        return True
    
    try:
        # Start the server in a separate process
        server_process = subprocess.Popen([
            sys.executable, "simple_app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        print("⏳ Waiting for server to start...")
        for i in range(30):  # Wait up to 30 seconds
            time.sleep(1)
            if check_server_running():
                print("✅ Backend server started successfully!")
                return True
            print(f"   Attempt {i+1}/30...")
        
        print("❌ Failed to start backend server")
        return False
        
    except Exception as e:
        print(f"❌ Error starting backend server: {str(e)}")
        return False

def open_frontend():
    """Open the frontend HTML file in the default browser"""
    html_file = Path("Crop_Project.html")
    
    if not html_file.exists():
        print("❌ Crop_Project.html not found!")
        return False
    
    try:
        # Get absolute path and convert to file URL
        html_path = html_file.absolute()
        file_url = f"file:///{html_path.as_posix()}"
        
        print("🌐 Opening Crop Recommendation System in your browser...")
        webbrowser.open(file_url)
        return True
        
    except Exception as e:
        print(f"❌ Error opening browser: {str(e)}")
        return False

def main():
    """Main launcher function"""
    print("🌱 Crop Recommendation System Launcher")
    print("=" * 50)
    
    # Start backend server
    if not start_backend_server():
        print("\n❌ Failed to start the application. Please check the error messages above.")
        input("Press Enter to exit...")
        return
    
    # Open frontend
    if not open_frontend():
        print("\n❌ Failed to open the frontend. Please manually open Crop_Project.html in your browser.")
        input("Press Enter to exit...")
        return
    
    print("\n🎉 Crop Recommendation System is now running!")
    print("\n📋 What's running:")
    print("   • Backend API: http://127.0.0.1:5000")
    print("   • Frontend: Crop_Project.html (opened in browser)")
    print("\n💡 Tips:")
    print("   • Keep this window open to keep the server running")
    print("   • Close this window to stop the server")
    print("   • If you see errors in the web app, check this window for server messages")
    
    try:
        # Keep the script running
        print("\n🔄 Server is running... Press Ctrl+C to stop")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Stopping Crop Recommendation System...")
        print("✅ Application stopped successfully!")

if __name__ == "__main__":
    main()
