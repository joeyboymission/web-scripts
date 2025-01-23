# Teetime AutoLogin and AutoBook

## Description

This script automates the login and booking process for the Tagaytay Highlands Teetime Golf Booking System. It provides a user-friendly interface to manage golf tee time bookings with automated form filling and scheduling capabilities.

## Features

### Authentication
- Automatic login with saved credentials
- Secure credential management
- Session handling and auto-retry on session expiration

### Booking Automation
- Course selection from multiple options:
  - Highlands Golf Course
  - Midlands Front 9 - Back 9
  - Midlands Back 9 - Lucky 9
  - Midlands Lucky 9 - Front 9
- Date selection with intelligent handling of:
  - Maintenance days
  - Fully booked dates
  - Unavailable dates
- Time slot selection with preferences:
  - Multiple time slot options (6:00 AM - 3:30 PM)
  - Automatic fallback to next available slot
- Player details management for up to 4 players

### User Interface
- Floating GUI panel with:
  - Minimizable interface
  - Real-time status updates
  - Progress indicators
  - Start/Stop controls
- Notification system for:
  - Success messages
  - Warnings
  - Error alerts

### Smart Scheduling
- Scheduled automation trigger
- Persistent state management
- Auto-resume on page reload or browser restart

## Setup Instructions

1. Install a UserScript Manager:
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Install the Script:
   - Click the UserScript manager icon
   - Select "Create new script"
   - Copy and paste the entire content of `teetime_autologin.user.js`
   - Save the script

## Usage

1. Navigate to the Tagaytay Highlands Teetime website
2. The floating GUI will appear on the right side of the screen
3. Fill in the required information:
   - Login credentials
   - Trigger date and time
   - Golf course preference
   - Booking date
   - Preferred time slots
   - Player details

4. Click "Start" to begin the automation
5. Monitor the status through the GUI
6. Use "Stop" if you need to pause the automation

## Error Handling

The script handles various scenarios:
- Invalid credentials
- Maintenance days
- Fully booked slots
- Session timeouts
- Network errors
- Invalid date/time selections

## State Management

The automation maintains its state across page reloads and handles:
- Login state
- Booking progress
- Form data persistence
- Error recovery
- Session management

## Compatibility

- Browser Support:
  - Chrome 88+
  - Firefox 78+
  - Edge 88+
  - Safari 14+

- Website Compatibility:
  - Tagaytay Highlands Teetime Booking System

## Support and Maintenance

Created and maintained by JOIBOI and Keiane
For issues or feature requests, please contact the developers.

## Version History

- v0.1 (2024)
  - Initial release
  - Basic automation features
  - GUI implementation
  - State management
  - Error handling

## License

This script is provided as-is without any warranty. Use at your own risk.

