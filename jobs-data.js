// Jobs Database - Update this file to change jobs for all visitors
// This file is loaded by both the public site and admin panel

window.JOBS_DATABASE = [
    {
        id: 1,
        title: "Frontend Developer",
        salary: "$60,000 - $80,000",
        location: "New York, NY",
        requirements: "3+ years experience with React, JavaScript, HTML, CSS. Strong understanding of responsive design and modern frontend frameworks.",
        applyLink: "https://example.com/apply/frontend",
        image: "https://via.placeholder.com/400x200/4f46e5/ffffff?text=Frontend+Developer",
        createdAt: 1704067200000,
        order: 1
    },
    {
        id: 2,
        title: "Backend Developer",
        salary: "$70,000 - $90,000",
        location: "San Francisco, CA",
        requirements: "5+ years experience with Node.js, Python, or Java. Database design and optimization skills.",
        applyLink: "https://example.com/apply/backend",
        image: "https://via.placeholder.com/400x200/059669/ffffff?text=Backend+Developer",
        createdAt: 1704067200000,
        order: 2
    },
    {
        id: 3,
        title: "UI/UX Designer",
        salary: "$55,000 - $75,000",
        location: "Remote",
        requirements: "Portfolio showcasing user-centered design solutions. Proficiency in Figma, Sketch, or Adobe Creative Suite.",
        applyLink: "https://example.com/apply/designer",
        image: "https://via.placeholder.com/400x200/ec4899/ffffff?text=UI%2FUX+Designer",
        createdAt: 1704067200000,
        order: 3
    }
];

// Site Settings - Update these to change site appearance for all visitors
window.SITE_SETTINGS = {
    siteTitle: "JobPortal",
    siteDescription: "Discover amazing career opportunities with top companies",
    heroTitle: "Job Opportunity",
    heroSubtitle: "Discover amazing career opportunities with top companies",
    template: "modern",
    theme: "blue",
    heroTemplate: "gradient"
};
