
// Toggle Hamburger Menu
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('change', function() {
        navMenu.classList.toggle('open');
    });
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('serviceworker.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    });
};



// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('serviceworker.js')
            .then(function(registration) {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Form Submission to Email
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    alert('Your message has been sent successfully!');
                    contactForm.reset();
                } else {
                    alert('There was a problem sending your message. Please try again later.');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('There was a problem sending your message. Please try again later.');
            });
        });
    }
});

// JavaScript to disable right-click context menu globally and on a specific section
document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click context menu globally
    document.body.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable right-click context menu on a specific section
    const sectionElement = document.getElementById('youDivSectionId');
    if (sectionElement) {
        sectionElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    }
    
    // Disable cut, copy, and paste actions
    document.addEventListener('cut', function(e) {
        e.preventDefault();
    });
    document.addEventListener('copy', function(e) {
        e.preventDefault();
    });
    document.addEventListener('paste', function(e) {
        e.preventDefault();
    });

    // Disable certain key combinations
    document.addEventListener('keydown', function(event) {
        // Disable F12 (Developer Tools)
        if (event.keyCode === 123) {
            event.preventDefault();
        }
        // Disable Ctrl+U (View Page Source), Ctrl+A (Select All), Ctrl+S (Save)
        if (event.ctrlKey && (event.keyCode === 85 || event.keyCode === 83 || event.keyCode === 65)) {
            event.preventDefault();
        }
        // Disable Ctrl+Shift+I (Developer Tools)
        if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
            event.preventDefault();
        }
        // Disable Ctrl+P (Print)
        if (event.ctrlKey && event.keyCode === 80) {
            event.preventDefault();
        }
        // Disable Ctrl+V (Paste)
        if (event.ctrlKey && event.keyCode === 86) {
            event.preventDefault();
        }
    });
});

