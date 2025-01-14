# Web Automation Scripts

A collection of Tampermonkey and Violentmonkey userscripts for automating web.

## Scripts

### 1. Teetime AutoLogin and AutoBook
- **File:** [`teetime_autologin.user.js`](./teetime_autologin.user.js)
- **Purpose:** Automates login for Tagaytay Highlands Teetime Golf Booking System
- **Features:**
  - Auto-fills login credentials
  - Handles "Remember Me" checkbox
  - Shows alert for invalid credentials
  - Auto-closes error modals

### 2. ERS TUP Auto Login
- **File:** [`ers_tup_autologin.user.js`](./ers_tup_autologin.user.js)
- **Purpose:** Automates login for TUP Manila Student Portal
- **Features:**
  - Auto-fills student credentials
  - Works on the ERS (Education Records System) portal

## Setup Instructions

1. Install the Tampermonkey browser extension
2. Create a new userscript in Tampermonkey
3. Copy the desired script content
4. Update the credentials in the script:
   - For Teetime: Update `userName` and `password` variables
   - For ERS TUP: Update `userName` and `password` variables
5. Save the script and navigate to the respective website

## Security Note

⚠️ Never share scripts with your actual credentials. Always remove sensitive information before sharing.

## Disclaimer
These scripts are provided for educational purposes only. By using these scripts, you agree to:
- Use them responsibly and ethically
- Comply with the terms of service of target websites
- Accept all risks associated with automation
- Not use them for malicious purposes or unauthorized access

The author is not responsible for any misuse or potential consequences of using these scripts.
