# Valentine Garage App

## Assignment Project

**Repository:** `Mukowa8/MAP711s-Valetines-Garage`  
**Project name:** Valentine Garage  
**Platform:** Android  
**Framework:** Expo React Native  

---

## Project Overview

Valentine Garage is a mobile garage-management application built using **React Native with Expo**. The app is designed to help a garage manage vehicle check-ins, employee information, dashboard summaries, reports, and vehicle details in a simple mobile interface.

The project includes an updated modern user interface, a custom app logo, and Android configuration so that the application can be opened and tested through **Android Studio**, an Android emulator, or a real Android phone.

---

## Main Features

- Modern mobile dashboard for garage activity
- Vehicle check-in screen
- Employee management screen
- Vehicle details screen
- Reports screen
- Local app state management using React Context
- Updated app icon and splash assets
- Android project support for Android Studio
- Expo-based development workflow

---

## Technologies Used

- React Native
- Expo
- JavaScript
- Android Studio
- Gradle
- Android SDK
- JDK 17
- Git and GitHub

---

## Project Structure

```text
valentine-garage/
│
├── android/                  # Native Android project files
├── assets/                   # App icon, splash screen, and image assets
├── src/
│   ├── context/              # App context and shared state
│   ├── screens/              # Application screens
│   └── utils/                # Theme and utility files
│
├── App.js                    # Main app component
├── app.json                  # Expo app configuration
├── index.js                  # App entry point
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Locked dependency versions
└── README.md                 # Project documentation
```

---

## Requirements

Before running the project, make sure the following are installed:

1. **Node.js**
2. **npm**
3. **Android Studio**
4. **Android SDK**
5. **JDK 17**
6. **Git**

To check Java version:

```powershell
java -version
```

The expected version should show Java 17, for example:

```text
openjdk version "17.x.x"
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Mukowa8/MAP711s-Valetines-Garage.git
```

Move into the project folder:

```bash
cd MAP711s-Valetines-Garage
```

Install dependencies:

```bash
npm install
```

---

## Running the App on Android

### Option 1: Run on Android Emulator

1. Open Android Studio.
2. Go to:

```text
Tools → Device Manager
```

3. Start an Android emulator.
4. In the project terminal, run:

```bash
npm run android
```

---

### Option 2: Run on a Real Android Phone

1. Enable Developer Options on the phone.
2. Enable USB Debugging.
3. Connect the phone using a USB data cable.
4. Confirm that the device is detected:

```powershell
adb devices
```

If `adb` is not recognized, use the full path:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Then run:

```bash
npm run android
```

---

## Useful Commands

Start Expo development server:

```bash
npx expo start
```

Run on Android:

```bash
npm run android
```

Clean Android build:

```powershell
cd android
.\gradlew.bat clean
cd ..
```

Stop Gradle daemon:

```powershell
cd android
.\gradlew.bat --stop
cd ..
```

---

## Android Build Notes

This project requires a valid Android SDK path. The file below is used locally:

```text
android/local.properties
```

Example content:

```text
sdk.dir=C:/Users/YOUR_USERNAME/AppData/Local/Android/Sdk
```

This file should not be committed to GitHub because it is specific to each computer.

---

## Troubleshooting

### 1. No Android device found

If you see:

```text
No Android connected device found
```

Make sure that:

- An Android emulator is open, or
- A real Android phone is connected
- USB debugging is enabled
- The phone appears when running:

```powershell
adb devices
```

---

### 2. ADB is not recognized

Use the full ADB path:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

You may also add this folder to Windows PATH:

```text
C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
```

---

### 3. SDK location not found

Create or update:

```text
android/local.properties
```

Add:

```text
sdk.dir=C:/Users/YOUR_USERNAME/AppData/Local/Android/Sdk
```

---

### 4. Gradle or CMake errors

Make sure Java is set to JDK 17:

```powershell
java -version
```

If needed, install JDK 17 and set `JAVA_HOME`.

---

### 5. Unable to connect to localhost

If the app opens but cannot connect to the development server, run:

```powershell
adb reverse tcp:8081 tcp:8081
```

Then restart the app:

```bash
npm run android
```

---

## GitHub Repository

Repository:

```text
https://github.com/Mukowa8/MAP711s-Valetines-Garage
```

---

## Author

**Student:** Daniel Barnabas  
**Project:** Valentine Garage Mobile App  
**Assignment:** Mobile Application Development / MAP711s  

---

## Conclusion

This project demonstrates the development of a garage-management mobile application using React Native and Expo. It includes a modernized user interface, Android Studio support, custom branding, and practical screens for managing garage operations.
