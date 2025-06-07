// Global Navigation Functions
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Set minimum date to today for all date inputs
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = today;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'linear-gradient(135deg, rgba(75, 0, 130, 0.95), rgba(106, 13, 173, 0.95))';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, #4B0082, #6A0DAD)';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .feature-item, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Homepage specific functions
function scrollToServices() {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        servicesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form validation utilities
function validateForm(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`${field} wajib diisi`);
        }
    });

    return errors;
}

function showAlert(message, type = 'error') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // Insert alert at the top of the form container
    const formContainer = document.querySelector('.booking-form-container');
    if (formContainer) {
        formContainer.insertBefore(alert, formContainer.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Price formatting utility
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// Date formatting utility
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Loading state management
function showLoading(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> Mencari...';
    
    return function hideLoading() {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Generic search results display
function displayResults(results, containerId, cardGenerator) {
    const container = document.getElementById(containerId);
    const resultsSection = container.closest('.search-results');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<div class="text-center"><p>Tidak ada hasil ditemukan. Silakan coba dengan kriteria pencarian yang berbeda.</p></div>';
    } else {
        container.innerHTML = results.map(cardGenerator).join('');
    }
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Local storage utilities
function saveSearchHistory(searchData, type) {
    const history = JSON.parse(localStorage.getItem(`${type}_history`) || '[]');
    history.unshift(searchData);
    
    // Keep only last 5 searches
    if (history.length > 5) {
        history.pop();
    }
    
    localStorage.setItem(`${type}_history`, JSON.stringify(history));
}

function getSearchHistory(type) {
    return JSON.parse(localStorage.getItem(`${type}_history`) || '[]');
}

// Booking simulation
function simulateBooking(details) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const bookingId = 'TN' + Date.now().toString().slice(-8);
            resolve({
                success: true,
                bookingId: bookingId,
                message: `Booking berhasil! ID Booking: ${bookingId}`,
                details: details
            });
        }, 2000);
    });
}

// Export functions for use in other scripts
window.TravelNesia = {
    validateForm,
    showAlert,
    formatPrice,
    formatDate,
    showLoading,
    displayResults,
    saveSearchHistory,
    getSearchHistory,
    simulateBooking
};