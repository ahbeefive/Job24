// Settings loader for public site
// This file ensures settings are applied correctly from localStorage and config.js

(function() {
    'use strict';
    
    // Load and apply settings from localStorage
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('jobPortalSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                applySettings(settings);
            }
        } catch (e) {
            console.log('Using default settings');
        }
    }
    
    // Apply settings to the page
    function applySettings(settings) {
        // Update document title
        if (settings.siteTitle) {
            document.title = settings.siteTitle;
        }
        
        // Update logo
        const logoElement = document.querySelector('.logo');
        if (logoElement && settings.siteTitle) {
            logoElement.textContent = settings.siteTitle;
        }
        
        // Update hero section
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle && settings.heroTitle) {
            heroTitle.textContent = settings.heroTitle;
        }
        
        const heroSubtitle = document.querySelector('.hero p');
        if (heroSubtitle && settings.heroSubtitle) {
            heroSubtitle.textContent = settings.heroSubtitle;
        }
        
        // Apply template
        if (settings.template) {
            document.body.setAttribute('data-template', settings.template);
        }
        
        // Apply theme
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
            applyThemeColors(settings.theme);
        }
        
        // Apply hero template
        if (settings.heroTemplate) {
            const heroElement = document.querySelector('.hero');
            if (heroElement) {
                heroElement.setAttribute('data-hero-template', settings.heroTemplate);
            }
        }
    }
    
    // Apply theme colors
    function applyThemeColors(theme) {
        const themeColors = {
            blue: { primary: '#4f46e5', secondary: '#06b6d4', accent: '#10b981' },
            purple: { primary: '#8b5cf6', secondary: '#a855f7', accent: '#c084fc' },
            green: { primary: '#10b981', secondary: '#059669', accent: '#047857' },
            orange: { primary: '#f97316', secondary: '#ea580c', accent: '#dc2626' },
            red: { primary: '#ef4444', secondary: '#dc2626', accent: '#b91c1c' },
            pink: { primary: '#ec4899', secondary: '#db2777', accent: '#be185d' },
            teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#0f766e' },
            dark: { primary: '#374151', secondary: '#4b5563', accent: '#6b7280' }
        };
        
        const colors = themeColors[theme] || themeColors.blue;
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSettings);
    } else {
        loadSettings();
    }
    
    // Listen for storage changes from admin panel
    window.addEventListener('storage', function(e) {
        if (e.key === 'jobPortalSettings') {
            loadSettings();
        }
    });
})();
