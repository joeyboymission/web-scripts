from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.edge.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import time
import datetime
import os
import sys

def log_message(message):
    """Print a log message with timestamp"""
    timestamp = datetime.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    print(f"{timestamp} {message}")

# Priority list of people to send streak messages to
PRIORITY_USERS = [
    "L4NC3",
    "ry",
    "lemmmy",
    "Rea Mae ❤️❤️❤️",
    "Keiane",
    "Uiharu",
    "woogie"
]

# Setup WebDriver (using webdriver-manager to handle the driver automatically)
log_message("Setting up the Edge WebDriver...")
service = Service(EdgeChromiumDriverManager().install())

# Configure Edge options
edge_options = Options()
edge_options.add_argument("--start-maximized")  # Start with maximized window
edge_options.use_chromium = True

# Important: Add this to avoid the DevToolsActivePort error
edge_options.add_argument("--remote-debugging-port=9222")

# Fix for "Edge crashed" error - don't use existing profile for now
# Instead of trying to use the existing profile, we'll create a temporary one
log_message("Using a fresh browser instance (safer option to avoid crashes)")

# Initialize driver variable before try block
driver = None

try:
    # Initialize the WebDriver with options
    log_message("Starting Edge browser...")
    driver = webdriver.Edge(service=service, options=edge_options)
    
    # 1. Open TikTok messages page
    website_url = "https://www.tiktok.com/messages?lang=en"
    log_message(f"Opening URL: {website_url}")
    driver.get(website_url)
    
    # Wait for page to load
    log_message("Waiting for the page to load...")
    time.sleep(5)  # Initial wait for page load
    
    # Verify current URL
    current_url = driver.current_url
    log_message(f"Current URL: {current_url}")
    
    if "tiktok.com/messages" not in current_url and "tiktok.com" in current_url:
        log_message("On TikTok but not on messages page. Navigating to messages...")
        driver.get(website_url)
        time.sleep(3)
    
    # Check if login is needed
    log_message("Checking if login is needed...")
    
    # Wait for user to log in manually
    log_message("Since we're using a fresh browser, you'll need to log in.")
    log_message("Please log in to your TikTok account now.")
    input("After you've logged in, press Enter to continue...")
    
    # Wait for the message list container to be visible
    message_container_present = False
    try:
        log_message("Looking for the message container...")
        WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "div.css-149gota-DivScrollWrapper"))
        )
        message_container_present = True
        log_message("Message container found!")
    except TimeoutException:
        log_message("Timed out waiting for message container.")
        
    # If message container is not found after login, try refreshing
    if not message_container_present:
        log_message("Refreshing the page to see if that helps...")
        driver.refresh()
        time.sleep(5)
        
        try:
            WebDriverWait(driver, 15).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "div.css-149gota-DivScrollWrapper"))
            )
            message_container_present = True
            log_message("Message container found after refreshing!")
        except TimeoutException:
            log_message("Still can't find message container. Please check if you're properly logged in.")
    
    # Proceed if the message container is found
    if message_container_present:
        log_message("Starting to process priority users...")
        users_processed = 0
        
        # Process each user in priority order
        for user in PRIORITY_USERS:
            log_message(f"Looking for user: {user}")
            
            # Find the user in the chat list
            try:
                # Look for the user's name in chat list
                user_elements = driver.find_elements(By.CSS_SELECTOR, "p.css-16y88xx-PInfoNickname")
                user_found = False
                
                for element in user_elements:
                    if element.text.strip() == user:
                        log_message(f"Found user: {user}! Clicking to open chat...")
                        
                        # Click on the chat item (parent div of the username element)
                        parent_div = element.find_element(By.XPATH, "../..")
                        chat_item = parent_div.find_element(By.XPATH, "../..")
                        chat_item.click()
                        
                        log_message(f"Clicked on user: {user}")
                        time.sleep(3)  # Wait for chat to load
                        user_found = True
                        
                        # Verify if chat is opened by looking for message input
                        try:
                            # Look for the DraftEditor content div
                            WebDriverWait(driver, 10).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, "div.public-DraftEditor-content"))
                            )
                            
                            log_message(f"Chat with {user} is now open. Finding message input...")
                            
                            # Use JavaScript to input text in the message box
                            js_script = """
                            // Find the DraftEditor input
                            const editorDiv = document.querySelector('div.public-DraftEditor-content');
                            if (editorDiv) {
                                // Focus the editor
                                editorDiv.focus();
                                
                                // Dispatch events to simulate typing
                                const inputEvent = new InputEvent('input', {
                                    bubbles: true,
                                    cancelable: true,
                                    data: 'STREAK SAVER 🔥🔥🔥'
                                });
                                
                                editorDiv.dispatchEvent(inputEvent);
                                
                                // Return true if successful
                                return true;
                            }
                            return false;
                            """
                            
                            input_success = driver.execute_script(js_script)
                            
                            if input_success:
                                log_message(f"Successfully input 'STREAK SAVER 🔥🔥🔥' for {user} (NOT SENT - Debug Mode)")
                                users_processed += 1
                            else:
                                log_message(f"Failed to input text for {user}")
                            
                            # Wait a moment to observe the input (for debugging)
                            time.sleep(2)
                            
                        except TimeoutException:
                            log_message(f"Failed to find message input for {user}")
                        
                        break
                
                if not user_found:
                    log_message(f"User {user} not found in the chat list")
            
            except Exception as e:
                log_message(f"Error processing user {user}: {str(e)}")
        
        log_message(f"Processing complete. Processed {users_processed} out of {len(PRIORITY_USERS)} users.")
    
    else:
        log_message("Could not locate the message container. Automation cannot proceed.")

except WebDriverException as e:
    log_message(f"WebDriver error: {e}")
    if "crashed" in str(e):
        log_message("Edge browser crashed. This might be due to conflicts with an existing browser instance.")
        log_message("Try closing all Edge windows before running this script.")
except Exception as e:
    log_message(f"An error occurred: {e}")

finally:
    log_message("Script execution completed. Browser will close in 5 seconds...")
    time.sleep(5)  # Keep browser open briefly to see final state
    
    # Safely quit the browser if it was initialized
    if driver is not None:
        try:
            driver.quit()
            log_message("Browser closed.")
        except Exception as e:
            log_message(f"Error closing browser: {e}")
    else:
        log_message("Browser was not initialized successfully.")