// Site Configuration - Updated by Admin Panel
window.SITE_CONFIG = {
    siteTitle: "JobPortal",
    siteDescription: "Discover amazing career opportunities with top companies",
    heroTitle: "Job Opportunity", 
    heroSubtitle: "Discover amazing career opportunities with top companies",
    template: "modern",
    theme: "blue",
    heroTemplate: "gradient",
    lastUpdated: Date.now(),
    jobs: [] // Jobs will be loaded from localStorage
};

// Auto-apply settings when this file loads
(function() {
    'use strict';
    
    function applyConfig() {
        // Try to load from localStorage first (admin panel updates)
        try {
            const savedSettings = localStorage.getItem('jobPortalSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                Object.assign(window.SITE_CONFIG, settings);
            }
        } catch (e) {
            console.log('Using default config');
        }
        
        // Apply site title
        if (window.SITE_CONFIG.siteTitle) {
            document.title = window.SITE_CONFIG.siteTitle;
            const logoElement = document.querySelector('.logo');
            if (logoElement) {
                logoElement.textContent = window.SITE_CONFIG.siteTitle;
            }
        }
        
        // Apply hero content
        if (window.SITE_CONFIG.heroTitle) {
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) {
                heroTitle.textContent = window.SITE_CONFIG.heroTitle;
            }
        }
        
        if (window.SITE_CONFIG.heroSubtitle) {
            const heroSubtitle = document.querySelector('.hero p');
            if (heroSubtitle) {
                heroSubtitle.textContent = window.SITE_CONFIG.heroSubtitle;
            }
        }
        
        // Apply template
        if (window.SITE_CONFIG.template) {
            document.body.setAttribute('data-template', window.SITE_CONFIG.template);
        }
        
        // Apply theme
        if (window.SITE_CONFIG.theme) {
            document.body.setAttribute('data-theme', window.SITE_CONFIG.theme);
            applyThemeColors(window.SITE_CONFIG.theme);
        }
        
        // Apply hero template
        if (window.SITE_CONFIG.heroTemplate) {
            const heroElement = document.querySelector('.hero');
            if (heroElement) {
                heroElement.setAttribute('data-hero-template', window.SITE_CONFIG.heroTemplate);
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
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyConfig);
    } else {
        applyConfig();
    }
})();