// ==UserScript==
// @name         Modal Killer
// @namespace    http://tampermonkey.net/
// @version      Alpha test
// @description  A simple script to close the modal that appears on the Tagaytay Highlands Teetime website.
// @author       JOIBOI and Keiane
// @match        https://tagaytayhighlands-teetime.com/
// @match        https://tagaytayhighlands-teetime.com/index.php?w=1
// @match        https://tagaytayhighlands-teetime.com/index.php
// @match        https://tagaytayhighlands-teetime.com/t/index.php?v=1
// @match        https://tagaytayhighlands-teetime.com/t/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tagaytayhighlands-teetime.com
// @grant        none
// ==/UserScript==

function closeModal() {
    // Specifically target the wrongpass modal first
    const wrongPassModal = document.querySelector('.modal.wrongpass.show');
    const anyModal = document.querySelector('.modal.show');
    const modalToClose = wrongPassModal || anyModal;

    if (modalToClose) {
        try {
            // Click the close button if it exists
            const closeButton = modalToClose.querySelector('.btn-close, .btn-secondary');
            if (closeButton) {
                closeButton.click();
            }

            // Force cleanup if modal still persists
            modalToClose.classList.remove('show');
            modalToClose.classList.remove('fade');
            modalToClose.style.display = 'none';
            modalToClose.setAttribute('aria-modal', 'false');
            modalToClose.setAttribute('aria-hidden', 'true');
            
            // Remove backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            // Clean up body
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('padding-right');
            document.body.style.overflow = 'auto';

            // Clean up modal
            modalToClose.style.removeProperty('padding-right');
            
            console.log('Modal killed successfully');
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    }
}

// Initial cleanup
closeModal();

// Set up continuous monitoring
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length || 
            (mutation.target.classList && mutation.target.classList.contains('show'))) {
            closeModal();
        }
    });
});

// Start observing with enhanced options
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
});

// Additional interval check for stubborn modals
setInterval(closeModal, 1000);