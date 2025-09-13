# 🌱 Crop Recommendation System - Quick Start Guide

## 🚀 How to Run (Easiest Method)

### Option 1: Double-Click Method (Recommended)
1. **Double-click** `START_CROP_SYSTEM.bat`
2. The system will automatically:
   - Check if Python is installed
   - Start the backend server
   - Open the web application in your browser
3. **Keep the command window open** while using the app
4. **Close the command window** to stop the server

### Option 2: Python Method
1. Open Command Prompt or PowerShell
2. Navigate to the project folder: `cd "C:\Users\Jay\Desktop\Project"`
3. Run: `python launch_app.py`
4. The system will start automatically

## 🎯 How to Use

1. **Fill in the form** with your soil and weather data:
   - Nitrogen (N), Phosphorus (P), Potassium (K)
   - Temperature (°C), Humidity (%), pH Level
   - Rainfall (mm)

2. **Click "Get Crop Recommendation"**

3. **View the result** with confidence percentage

4. **Check recent recommendations** at the bottom

## 🔧 Troubleshooting

### ❌ "Server is not running" Error
- **Solution**: Run `START_CROP_SYSTEM.bat` or `python launch_app.py`
- **Keep the command window open** while using the app

### ❌ "Python is not installed" Error
- **Solution**: Install Python from https://python.org
- Make sure to check "Add Python to PATH" during installation

### ❌ "Files not found" Error
- **Solution**: Make sure you're in the correct project directory
- All files should be in the same folder

### ❌ Browser doesn't open automatically
- **Solution**: Manually open `Crop_Project.html` in your browser
- The server will still be running in the background

## 📁 File Structure
```
Project/
├── START_CROP_SYSTEM.bat    ← Double-click this to start
├── launch_app.py            ← Main launcher script
├── simple_app.py            ← Backend server
├── Crop_Project.html        ← Frontend web app
├── requirements.txt         ← Python dependencies
└── QUICK_START.md          ← This guide
```

## 🎉 Success Indicators

### ✅ When Everything Works:
- Command window shows "✅ Backend server started successfully!"
- Browser opens with the crop recommendation form
- Green "✅ Server connected" status in the web app
- You can get crop recommendations without errors

### ❌ When Something's Wrong:
- Red "❌ Server disconnected" status in the web app
- Error messages in the command window
- "Failed to get recommendation" errors

## 💡 Tips

1. **Always keep the command window open** while using the app
2. **Close the command window** when you're done to stop the server
3. **Check the server status** indicator in the web app
4. **Recent recommendations** are saved in your browser
5. **Use the batch file** for the easiest startup experience

## 🆘 Need Help?

If you're still having issues:
1. Make sure Python is installed and in your PATH
2. Check that all files are in the same directory
3. Try running `python launch_app.py` directly
4. Check the command window for error messages

---

**Happy Farming! 🌾**
