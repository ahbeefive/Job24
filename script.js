// Simple Job Portal Script
let jobs = [];
let currentTemplate = 'modern';
let currentTheme = 'blue';

// Default jobs data (fallback)
const defaultJobs = [
    {
        id: 1,
        title: "Frontend Developer",
        salary: "$60,000 - $80,000",
        location: "New York, NY",
        requirements: "3+ years experience with React, JavaScript, HTML, CSS. Strong understanding of responsive design and modern frontend frameworks.",
        applyLink: "https://example.com/apply/frontend",
        image: "https://via.placeholder.com/400x200/4f46e5/ffffff?text=Frontend+Developer"
    },
    {
        id: 2,
        title: "Backend Developer", 
        salary: "$70,000 - $90,000",
        location: "San Francisco, CA",
        requirements: "5+ years experience with Node.js, Python, or Java. Database design and optimization skills.",
        applyLink: "https://example.com/apply/backend",
        image: "https://via.placeholder.com/400x200/059669/ffffff?text=Backend+Developer"
    },
    {
        id: 3,
        title: "UI/UX Designer",
        salary: "$55,000 - $75,000", 
        location: "Remote",
        requirements: "Portfolio showcasing user-centered design solutions. Proficiency in Figma, Sketch, or Adobe Creative Suite.",
        applyLink: "https://example.com/apply/designer",
        image: "https://via.placeholder.com/400x200/ec4899/ffffff?text=UI%2FUX+Designer"
    }
];

// Load jobs - Priority: jobs-data.js > localStorage > defaults
function loadJobs() {
    // First priority: jobs-data.js (for all visitors)
    if (window.JOBS_DATABASE && window.JOBS_DATABASE.length > 0) {
        jobs = [...window.JOBS_DATABASE];
        console.log('✅ Loaded jobs from jobs-data.js (shared for all visitors):', jobs.length);
        return;
    }
    
    // Second priority: localStorage (admin preview)
    const savedJobs = localStorage.getItem('jobPortalJobs');
    if (savedJobs) {
        try {
            jobs = JSON.parse(savedJobs);
            if (jobs.length > 0) {
                console.log('✅ Loaded jobs from localStorage (admin preview):', jobs.length);
                return;
            }
        } catch (e) {
            console.log('❌ Error parsing saved jobs');
        }
    }
    
    // Third priority: SITE_CONFIG (legacy)
    if (window.SITE_CONFIG && window.SITE_CONFIG.jobs && window.SITE_CONFIG.jobs.length > 0) {
        jobs = [...window.SITE_CONFIG.jobs];
        console.log('✅ Loaded jobs from SITE_CONFIG:', jobs.length);
        return;
    }
    
    // Finally use default jobs
    jobs = [...defaultJobs];
    console.log('✅ Using default jobs:', jobs.length);
}

// Load template and theme settings
function loadSettings() {
    // First priority: SITE_SETTINGS from jobs-data.js (for all visitors)
    if (window.SITE_SETTINGS) {
        currentTemplate = window.SITE_SETTINGS.template || 'modern';
        currentTheme = window.SITE_SETTINGS.theme || 'blue';
        
        // Apply template and theme
        document.body.setAttribute('data-template', currentTemplate);
        document.body.setAttribute('data-theme', currentTheme);
        
        // Update site content
        if (window.SITE_SETTINGS.siteTitle) {
            document.title = window.SITE_SETTINGS.siteTitle;
            const logoElement = document.querySelector('.logo');
            if (logoElement) logoElement.textContent = window.SITE_SETTINGS.siteTitle;
        }
        
        if (window.SITE_SETTINGS.heroTitle) {
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) heroTitle.textContent = window.SITE_SETTINGS.heroTitle;
        }
        
        if (window.SITE_SETTINGS.heroSubtitle) {
            const heroSubtitle = document.querySelector('.hero p');
            if (heroSubtitle) heroSubtitle.textContent = window.SITE_SETTINGS.heroSubtitle;
        }
        
        console.log('✅ Applied settings from jobs-data.js (shared for all visitors)');
        return;
    }
    
    // Second priority: localStorage (admin preview)
    const savedSettings = localStorage.getItem('jobPortalSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            currentTemplate = settings.template || 'modern';
            currentTheme = settings.theme || 'blue';
            
            // Apply template and theme
            document.body.setAttribute('data-template', currentTemplate);
            document.body.setAttribute('data-theme', currentTheme);
            
            // Update site content
            if (settings.siteTitle) {
                document.title = settings.siteTitle;
                document.querySelector('.logo').textContent = settings.siteTitle;
            }
            
            if (settings.heroTitle) {
                const heroTitle = document.querySelector('.hero h1');
                if (heroTitle) heroTitle.textContent = settings.heroTitle;
            }
            
            if (settings.heroSubtitle) {
                const heroSubtitle = document.querySelector('.hero p');
                if (heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle;
            }
            
            console.log('✅ Applied settings from localStorage (admin preview)');
        } catch (e) {
            console.log('Using default settings');
        }
    }
}

// Create job card HTML
function createJobCard(job) {
    const isLongText = job.requirements.length > 100;
    const shortText = isLongText ? job.requirements.substring(0, 100) + '...' : job.requirements;
    
    return `
        <div class="job-card">
            <img src="${job.image}" alt="${job.title}" class="job-image">
            <div class="job-content">
                <h3 class="job-title">${job.title}</h3>
                <div class="job-meta">
                    <span class="salary">💰 ${job.salary}</span>
                    <span class="location">📍 ${job.location}</span>
                </div>
                <div class="job-requirements" id="req-${job.id}">
                    <p>${shortText}</p>
                    ${isLongText ? `<button class="see-more" onclick="toggleRequirements(${job.id})">See more</button>` : ''}
                </div>
                <a href="${job.applyLink}" class="apply-btn" target="_blank">Apply Now</a>
            </div>
        </div>
    `;
}

// Toggle requirements text
function toggleRequirements(jobId) {
    const job = jobs.find(j => j.id === jobId);
    const reqElement = document.getElementById(`req-${jobId}`);
    const button = reqElement.querySelector('.see-more');
    const paragraph = reqElement.querySelector('p');
    
    if (button.textContent === 'See more') {
        paragraph.textContent = job.requirements;
        button.textContent = 'See less';
    } else {
        const shortText = job.requirements.substring(0, 100) + '...';
        paragraph.textContent = shortText;
        button.textContent = 'See more';
    }
}

// Render all jobs
function renderJobs() {
    const container = document.getElementById('jobsGrid');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = '<p class="no-jobs">No jobs available at the moment.</p>';
        container.classList.remove('single-job');
        return;
    }
    
    // Add single-job class for better centering when there's only one job
    if (jobs.length === 1) {
        container.classList.add('single-job');
    } else {
        container.classList.remove('single-job');
    }
    
    container.innerHTML = jobs.map(job => createJobCard(job)).join('');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    loadJobs();
    renderJobs();
    
    // Listen for updates from admin panel (for preview)
    window.addEventListener('storage', function(e) {
        if (e.key === 'jobPortalJobs') {
            loadJobs();
            renderJobs();
        } else if (e.key === 'jobPortalSettings') {
            loadSettings();
            renderJobs();
        }
    });
    
    // Listen for real-time template/theme changes
    window.addEventListener('templateChanged', function(e) {
        currentTemplate = e.detail;
        document.body.setAttribute('data-template', currentTemplate);
    });
    
    window.addEventListener('themeChanged', function(e) {
        currentTheme = e.detail;
        document.body.setAttribute('data-theme', currentTheme);
    });
});