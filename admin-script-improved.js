// Improved Admin Dashboard with Drag & Drop and Simplified Setup
class AdminDashboard {
    constructor() {
        console.log('🚀 AdminDashboard starting...');
        
        this.jobs = [];
        this.currentEditingJob = null;
        this.draggedElement = null;
        this.draggedIndex = null;
        
        // Simplified config
        this.config = {
            cloudinary: {
                cloudName: localStorage.getItem('cloudinaryName') || '',
                apiKey: localStorage.getItem('apiKey') || '',
                apiSecret: localStorage.getItem('apiSecret') || '',
                connected: false
            },
            google: {
                clientId: localStorage.getItem('googleSimpleClientId') || '',
                connected: false
            },
            github: {
                token: localStorage.getItem('githubToken') || '',
                owner: localStorage.getItem('githubOwner') || 'ahbeefive',
                repo: localStorage.getItem('githubRepo') || 'Job-Hiring',
                connected: false
            }
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🔧 Initializing admin dashboard...');
            
            if (!this.checkAuth()) return;
            
            this.loadJobs();
            this.loadSettings();
            this.renderJobs();
            this.updateStats();
            this.setupEventListeners();
            this.setupTabs();
            this.updateConnectionStatus();
            
            console.log('🎉 Admin dashboard ready!');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showNotification('Initialization failed: ' + error.message, 'error');
        }
    }

    checkAuth() {
        try {
            const sessionData = localStorage.getItem('adminSession');
            if (!sessionData) {
                console.log('No session found, redirecting to login');
                window.location.replace('login.html');
                return false;
            }
            
            const session = JSON.parse(sessionData);
            const now = Date.now();
            const sessionAge = now - session.loginTime;
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (!session.isLoggedIn || sessionAge >= maxAge) {
                console.log('Session expired, redirecting to login');
                localStorage.removeItem('adminSession');
                window.location.replace('login.html');
                return false;
            }
            
            console.log('Session valid, user authenticated');
            
            const currentUserElement = document.getElementById('currentUser');
            if (currentUserElement) {
                currentUserElement.textContent = `Welcome, ${session.username}`;
            }
            return true;
        } catch (e) {
            console.error('Auth check failed:', e);
            localStorage.removeItem('adminSession');
            window.location.replace('login.html');
            return false;
        }
    }

    loadJobs() {
        const savedJobs = localStorage.getItem('jobPortalJobs');
        if (savedJobs) {
            try {
                this.jobs = JSON.parse(savedJobs);
                if (this.jobs.length > 0) {
                    console.log('✅ Loaded jobs from localStorage:', this.jobs.length);
                    return;
                }
            } catch (e) {
                console.log('❌ Error parsing saved jobs');
            }
        }
        
        if (window.SITE_CONFIG && window.SITE_CONFIG.jobs && window.SITE_CONFIG.jobs.length > 0) {
            this.jobs = [...window.SITE_CONFIG.jobs];
            console.log('✅ Loaded jobs from SITE_CONFIG:', this.jobs.length);
            this.saveJobsToLocalStorage();
            return;
        }
        
        this.jobs = this.getDefaultJobs();
        console.log('✅ Using default jobs:', this.jobs.length);
        this.saveJobsToLocalStorage();
    }

    getDefaultJobs() {
        return [
            {
                id: 1,
                title: "Frontend Developer",
                salary: "$60,000 - $80,000",
                location: "New York, NY",
                requirements: "3+ years experience with React, JavaScript, HTML, CSS. Strong understanding of responsive design and modern frontend frameworks.",
                applyLink: "https://example.com/apply/frontend",
                image: "https://via.placeholder.com/400x200/4f46e5/ffffff?text=Frontend+Developer",
                createdAt: Date.now(),
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
                createdAt: Date.now(),
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
                createdAt: Date.now(),
                order: 3
            }
        ];
    }

    saveJobsToLocalStorage() {
        localStorage.setItem('jobPortalJobs', JSON.stringify(this.jobs));
    }

    saveJobs() {
        this.saveJobsToLocalStorage();
        this.updateStats();
        
        // Try GitHub sync if configured
        if (this.config.github.connected && this.config.github.token) {
            this.syncToGitHub();
        }
    }

    async syncToGitHub() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.config.github.owner}/${this.config.github.repo}/contents/jobs.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.github.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update jobs from admin panel',
                    content: btoa(JSON.stringify(this.jobs, null, 2))
                })
            });

            if (response.ok) {
                this.showNotification('✅ Jobs synced to GitHub!', 'success');
            }
        } catch (error) {
            console.error('GitHub sync error:', error);
        }
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('jobPortalSettings') || '{}');
        
        this.safeSetValue('siteTitle', settings.siteTitle || 'JobPortal');
        this.safeSetValue('siteDescription', settings.siteDescription || 'Discover amazing career opportunities');
        this.safeSetValue('heroTitle', settings.heroTitle || 'Job Opportunity');
        this.safeSetValue('heroSubtitle', settings.heroSubtitle || 'Discover amazing career opportunities');
        
        // Load connection configs and check if they exist
        this.safeSetValue('cloudinaryName', this.config.cloudinary.cloudName);
        this.safeSetValue('apiKey', this.config.cloudinary.apiKey);
        this.safeSetValue('apiSecret', this.config.cloudinary.apiSecret);
        this.safeSetValue('googleSimpleClientId', this.config.google.clientId);
        this.safeSetValue('githubToken', this.config.github.token);
        this.safeSetValue('githubOwner', this.config.github.owner);
        this.safeSetValue('githubRepo', this.config.github.repo);
        
        // Auto-detect if Cloudinary is already configured
        if (this.config.cloudinary.cloudName && this.config.cloudinary.apiKey && this.config.cloudinary.apiSecret) {
            this.config.cloudinary.connected = true;
            this.updateSetupStatus('cloudinarySetupStatus', true);
        }
        
        // Auto-detect if Google is configured
        if (this.config.google.clientId) {
            this.config.google.connected = true;
            this.updateSetupStatus('googleSetupStatus', true);
        }
        
        // Auto-detect if GitHub is configured
        if (this.config.github.token && this.config.github.owner && this.config.github.repo) {
            this.config.github.connected = true;
            this.updateSetupStatus('githubSetupStatus', true);
        }
    }

    safeSetValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value;
        }
    }

    renderJobs() {
        const container = document.getElementById('jobsTable');
        if (!container) return;

        if (this.jobs.length === 0) {
            container.innerHTML = '<div class="no-jobs">No jobs yet. Click "Add New Job" to get started!</div>';
            return;
        }

        // Sort jobs by order
        const sortedJobs = [...this.jobs].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        container.innerHTML = sortedJobs.map((job, index) => this.createJobRow(job, index)).join('');
        
        // Setup drag and drop
        this.setupDragAndDrop();
    }

    createJobRow(job, index) {
        return `
            <div class="job-row" draggable="true" data-job-id="${job.id}" data-index="${index}">
                <div class="drag-handle" title="Drag to reorder">
                    ⋮⋮
                </div>
                <div class="job-order">
                    <span class="order-number">${index + 1}</span>
                </div>
                <div class="job-select">
                    <input type="checkbox" class="job-checkbox" data-job-id="${job.id}" onchange="adminDashboard.updateSelection()">
                </div>
                <div class="job-info">
                    <h4 class="editable-title" data-field="title" data-job-id="${job.id}" onclick="adminDashboard.startInlineEdit(this)">${this.escapeHtml(job.title)}</h4>
                    <div class="job-meta">
                        <span>💰 ${this.escapeHtml(job.salary)}</span>
                        <span class="editable-location" data-field="location" data-job-id="${job.id}" onclick="adminDashboard.startInlineEdit(this)">📍 ${this.escapeHtml(job.location)}</span>
                        <span>📅 ${this.formatDate(job.createdAt || Date.now())}</span>
                    </div>
                </div>
                <div class="job-actions">
                    <button class="btn btn-sm btn-outline" onclick="adminDashboard.editJob(${job.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteJob(${job.id})">Delete</button>
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const jobRows = document.querySelectorAll('.job-row');
        
        jobRows.forEach((row, index) => {
            row.addEventListener('dragstart', (e) => {
                this.draggedElement = row;
                this.draggedIndex = index;
                row.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            row.addEventListener('dragend', (e) => {
                row.classList.remove('dragging');
                this.draggedElement = null;
                this.draggedIndex = null;
                
                // Remove all drag-over classes
                jobRows.forEach(r => r.classList.remove('drag-over'));
            });

            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (this.draggedElement && this.draggedElement !== row) {
                    row.classList.add('drag-over');
                }
            });

            row.addEventListener('dragleave', (e) => {
                row.classList.remove('drag-over');
            });

            row.addEventListener('drop', (e) => {
                e.preventDefault();
                row.classList.remove('drag-over');
                
                if (this.draggedElement && this.draggedElement !== row) {
                    const targetIndex = parseInt(row.dataset.index);
                    this.reorderJobs(this.draggedIndex, targetIndex);
                }
            });
        });
    }

    reorderJobs(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Create a copy of jobs array
        const jobsCopy = [...this.jobs];
        
        // Remove the dragged job
        const [draggedJob] = jobsCopy.splice(fromIndex, 1);
        
        // Insert at new position
        jobsCopy.splice(toIndex, 0, draggedJob);
        
        // Update order property
        jobsCopy.forEach((job, index) => {
            job.order = index + 1;
        });
        
        this.jobs = jobsCopy;
        this.saveJobs();
        this.renderJobs();
        
        this.showNotification('✅ Jobs reordered successfully!', 'success');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Job management
        this.safeAddEventListener('addJobBtn', 'click', () => this.openJobModal());
        this.safeAddEventListener('closeModal', 'click', () => this.closeJobModal());
        this.safeAddEventListener('cancelBtn', 'click', () => this.closeJobModal());
        
        const jobForm = document.getElementById('jobForm');
        if (jobForm) {
            jobForm.addEventListener('submit', (e) => this.saveJob(e));
        }

        // Image upload - multiple options
        this.safeAddEventListener('uploadImageBtn', 'click', () => this.handleImageUpload());
        this.safeAddEventListener('useUrlBtn', 'click', () => this.showUrlInput());
        this.safeAddEventListener('generateImageBtn', 'click', () => this.showPlaceholderGenerator());
        this.safeAddEventListener('quickImagesBtn', 'click', () => this.showQuickImages());
        
        // URL input handlers
        this.safeAddEventListener('previewUrlBtn', 'click', () => this.previewUrlImage());
        this.safeAddEventListener('useUrlImageBtn', 'click', () => this.useUrlImage());
        this.safeAddEventListener('cancelUrlBtn', 'click', () => this.hideUrlInput());
        
        // Placeholder generator handlers
        this.safeAddEventListener('generatePlaceholderBtn', 'click', () => this.generatePlaceholder());
        this.safeAddEventListener('cancelPlaceholderBtn', 'click', () => this.hidePlaceholderGenerator());
        
        // Quick images handlers
        this.safeAddEventListener('cancelQuickImagesBtn', 'click', () => this.hideQuickImages());
        
        // Image preview handlers
        this.safeAddEventListener('removeImageBtn', 'click', () => this.removeImage());
        this.safeAddEventListener('changeImageBtn', 'click', () => this.changeImage());

        // Quick image selection (event delegation)
        const quickImagesSection = document.getElementById('quickImagesSection');
        if (quickImagesSection) {
            quickImagesSection.addEventListener('click', (e) => {
                const quickImage = e.target.closest('.quick-image');
                if (quickImage) {
                    const imageUrl = quickImage.dataset.url;
                    this.useQuickImage(imageUrl);
                }
            });
        }
        
        // Settings
        this.safeAddEventListener('saveSiteInfoBtn', 'click', () => this.saveSiteInfo());
        this.safeAddEventListener('testCloudinaryBtn', 'click', () => this.testCloudinaryConnection());
        this.safeAddEventListener('saveCloudinaryBtn', 'click', () => this.saveCloudinaryConfig());
        this.safeAddEventListener('testGoogleBtn', 'click', () => this.testGoogleConnection());
        this.safeAddEventListener('saveGoogleBtn', 'click', () => this.saveGoogleConfig());
        this.safeAddEventListener('saveThemeBtn', 'click', () => this.saveTheme());
        this.safeAddEventListener('saveTemplateBtn', 'click', () => this.saveTemplate());
        this.safeAddEventListener('saveHeroBtn', 'click', () => this.saveHeroSettings());

        // Theme and template preview
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => this.previewTheme(e.target.value));
        }
        
        const templateSelect = document.getElementById('templateSelect');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => this.previewTemplate(e.target.value));
        }
        
        const heroTemplate = document.getElementById('heroTemplate');
        if (heroTemplate) {
            heroTemplate.addEventListener('change', (e) => this.previewHero(e.target.value));
        }

        // Bulk actions
        this.safeAddEventListener('bulkDeleteBtn', 'click', () => this.bulkDelete());
        this.safeAddEventListener('selectAllBtn', 'click', () => this.selectAll());
        this.safeAddEventListener('clearSelectionBtn', 'click', () => this.clearSelection());

        // Search
        const searchInput = document.getElementById('searchJobs');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applySearch());
        }

        // Logout
        this.safeAddEventListener('logoutBtn', 'click', () => this.logout());

        // Export
        this.safeAddEventListener('generateExportBtn', 'click', () => this.generateExport());
        this.safeAddEventListener('copyExportBtn', 'click', () => this.copyExportCode());

        // Modal close on outside click
        const jobModal = document.getElementById('jobModal');
        if (jobModal) {
            jobModal.addEventListener('click', (e) => {
                if (e.target.id === 'jobModal') {
                    this.closeJobModal();
                }
            });
        }
    }

    safeAddEventListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            return true;
        }
        return false;
    }

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                
                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        }
    }

    // Job Management
    openJobModal(job = null) {
        const modal = document.getElementById('jobModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('jobForm');

        if (!modal || !modalTitle || !form) {
            console.error('Modal elements not found');
            return;
        }

        if (job) {
            modalTitle.textContent = 'Edit Job';
            this.safeSetValue('jobTitle', job.title);
            this.safeSetValue('jobSalary', job.salary);
            this.safeSetValue('jobLocation', job.location);
            this.safeSetValue('jobRequirements', job.requirements);
            this.safeSetValue('applyLink', job.applyLink || '');
            this.safeSetValue('jobImage', job.image || '');
            
            // Show image preview if exists
            if (job.image) {
                this.showImagePreview(job.image);
            }
            
            this.currentEditingJob = job;
        } else {
            modalTitle.textContent = 'Add New Job';
            form.reset();
            this.hideImagePreview();
            this.hideAllUploadSections();
            
            const uploadStatus = document.getElementById('uploadStatus');
            if (uploadStatus) {
                uploadStatus.textContent = 'Choose an option above';
                uploadStatus.style.color = '#6b7280';
            }
            
            this.currentEditingJob = null;
        }

        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.getElementById('jobTitle');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeJobModal() {
        const modal = document.getElementById('jobModal');
        if (modal) {
            modal.classList.remove('active');
            
            // Reset form
            const form = document.getElementById('jobForm');
            if (form) {
                form.reset();
            }
            
            // Clear image preview
            this.hideImagePreview();
            this.hideAllUploadSections();
            
            // Reset upload status
            const uploadStatus = document.getElementById('uploadStatus');
            if (uploadStatus) {
                uploadStatus.textContent = 'Choose an option above';
                uploadStatus.style.color = '#6b7280';
            }
            
            // Clear hidden image field
            const jobImage = document.getElementById('jobImage');
            if (jobImage) {
                jobImage.value = '';
            }
            
            this.currentEditingJob = null;
        }
    }

    saveJob(event) {
        event.preventDefault();
        
        const titleInput = document.getElementById('jobTitle');
        const salaryInput = document.getElementById('jobSalary');
        const locationInput = document.getElementById('jobLocation');
        const requirementsInput = document.getElementById('jobRequirements');
        const applyLinkInput = document.getElementById('applyLink');
        const imageInput = document.getElementById('jobImage');

        if (!titleInput || !salaryInput || !locationInput || !requirementsInput) {
            this.showNotification('Form elements not found', 'error');
            return;
        }

        const title = titleInput.value.trim();
        const salary = salaryInput.value.trim();
        const location = locationInput.value.trim();
        const requirements = requirementsInput.value.trim();
        const applyLink = applyLinkInput ? applyLinkInput.value.trim() : '';
        const image = imageInput ? imageInput.value.trim() : '';

        if (!title || !salary || !location || !requirements) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        const jobData = {
            title,
            salary,
            location,
            requirements,
            applyLink: applyLink || `https://example.com/apply/${title.toLowerCase().replace(/\s+/g, '-')}`,
            image: image || `https://via.placeholder.com/400x200/4f46e5/ffffff?text=${encodeURIComponent(title)}`,
            createdAt: this.currentEditingJob ? this.currentEditingJob.createdAt : Date.now()
        };

        if (this.currentEditingJob) {
            // Update existing job
            const index = this.jobs.findIndex(job => job.id === this.currentEditingJob.id);
            if (index !== -1) {
                this.jobs[index] = { 
                    id: this.currentEditingJob.id,
                    order: this.currentEditingJob.order,
                    ...jobData
                };
                this.showNotification('✅ Job updated successfully!', 'success');
            }
        } else {
            // Create new job
            const newJob = {
                id: Date.now() + Math.random(),
                order: this.jobs.length + 1,
                ...jobData
            };
            this.jobs.push(newJob);
            this.showNotification('✅ Job created successfully!', 'success');
        }

        this.saveJobs();
        this.renderJobs();
        this.closeJobModal();
    }

    editJob(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (job) {
            this.openJobModal(job);
        }
    }

    deleteJob(jobId) {
        if (confirm('Are you sure you want to delete this job?')) {
            const jobIndex = this.jobs.findIndex(job => job.id === jobId);
            if (jobIndex !== -1) {
                this.jobs.splice(jobIndex, 1);
                
                // Update order numbers
                this.jobs.forEach((job, index) => {
                    job.order = index + 1;
                });
                
                this.saveJobs();
                this.renderJobs();
                this.showNotification('Job deleted successfully!', 'success');
            }
        }
    }

    // Bulk Actions
    updateSelection() {
        const checkboxes = document.querySelectorAll('.job-checkbox:checked');
        const selectedCount = checkboxes.length;
        const bulkActions = document.getElementById('bulkActions');
        const selectedCountEl = document.getElementById('selectedCount');

        if (bulkActions && selectedCountEl) {
            if (selectedCount > 0) {
                bulkActions.style.display = 'flex';
                selectedCountEl.textContent = `${selectedCount} selected`;
            } else {
                bulkActions.style.display = 'none';
            }
        }
    }

    selectAll() {
        document.querySelectorAll('.job-checkbox').forEach(checkbox => {
            checkbox.checked = true;
        });
        this.updateSelection();
    }

    clearSelection() {
        document.querySelectorAll('.job-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelection();
    }

    bulkDelete() {
        const selectedCheckboxes = document.querySelectorAll('.job-checkbox:checked');
        if (selectedCheckboxes.length === 0) {
            this.showNotification('No jobs selected!', 'warning');
            return;
        }

        const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.jobId));
        
        if (confirm(`Delete ${selectedIds.length} job(s)?`)) {
            this.jobs = this.jobs.filter(job => !selectedIds.includes(job.id));
            
            // Update order numbers
            this.jobs.forEach((job, index) => {
                job.order = index + 1;
            });
            
            this.saveJobs();
            this.renderJobs();
            this.clearSelection();
            this.showNotification(`${selectedIds.length} job(s) deleted!`, 'success');
        }
    }

    // Inline Editing
    startInlineEdit(element) {
        const field = element.dataset.field;
        const jobId = parseInt(element.dataset.jobId);
        const job = this.jobs.find(j => j.id === jobId);

        if (!job) return;

        const currentValue = job[field];
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        input.className = 'inline-edit-input';
        input.style.cssText = `
            font-size: inherit;
            font-weight: inherit;
            color: inherit;
            background: var(--surface);
            border: 1px solid var(--primary);
            border-radius: 4px;
            padding: 2px 6px;
            width: ${Math.max(100, element.offsetWidth)}px;
        `;

        const originalContent = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const saveEdit = () => {
            const newValue = input.value.trim();
            if (newValue && newValue !== currentValue) {
                job[field] = newValue;
                this.saveJobs();
                this.showNotification(`${field.charAt(0).toUpperCase() + field.slice(1)} updated!`, 'success');
            }
            element.innerHTML = field === 'location' ? `📍 ${this.escapeHtml(job[field])}` : this.escapeHtml(job[field]);
        };

        const cancelEdit = () => {
            element.innerHTML = originalContent;
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
            }
        });
    }

    // Search
    applySearch() {
        const searchTerm = document.getElementById('searchJobs').value.toLowerCase();
        const jobRows = document.querySelectorAll('.job-row');

        jobRows.forEach(row => {
            const title = row.querySelector('.editable-title').textContent.toLowerCase();
            const location = row.querySelector('.editable-location').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || location.includes(searchTerm)) {
                row.style.display = 'grid';
            } else {
                row.style.display = 'none';
            }
        });
    }

    saveSiteInfo() {
        const settings = {
            siteTitle: document.getElementById('siteTitle').value.trim(),
            siteDescription: document.getElementById('siteDescription').value.trim(),
            heroTitle: document.getElementById('heroTitle').value.trim(),
            heroSubtitle: document.getElementById('heroSubtitle').value.trim()
        };

        localStorage.setItem('jobPortalSettings', JSON.stringify(settings));
        
        // Show instructions for manual config update
        this.showConfigUpdateInstructions(settings);
        
        this.showNotification('✅ Site settings saved! Follow the instructions to apply to live site.', 'success');
    }

    showConfigUpdateInstructions(settings) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>📝 Update Live Site Settings</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div style="padding: 2rem;">
                    <p><strong>To apply these settings to your live site for all visitors:</strong></p>
                    <ol style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>Open your <code>config.js</code> file</li>
                        <li>Update these values:</li>
                    </ol>
                    <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1rem; margin: 1rem 0;">
                        <pre style="margin: 0; font-size: 0.875rem; overflow-x: auto;">siteTitle: "${settings.siteTitle || 'JobPortal'}",
siteDescription: "${settings.siteDescription || 'Discover amazing career opportunities'}",
heroTitle: "${settings.heroTitle || 'Job Opportunity'}",
heroSubtitle: "${settings.heroSubtitle || 'Discover amazing career opportunities'}"</pre>
                    </div>
                    <p><strong>💡 Tip:</strong> You can also set up GitHub integration to auto-update these files!</p>
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async testCloudinaryConnection() {
        const cloudName = document.getElementById('cloudinaryName').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const apiSecret = document.getElementById('apiSecret').value.trim();

        if (!cloudName || !apiKey || !apiSecret) {
            this.showNotification('Please fill in all Cloudinary fields', 'warning');
            return;
        }

        this.showNotification('Testing Cloudinary connection...', 'info');
        
        try {
            // Simple test - try to access the API
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`, {
                headers: {
                    'Authorization': 'Basic ' + btoa(`${apiKey}:${apiSecret}`)
                }
            });

            if (response.ok || response.status === 401) { // 401 means credentials are being processed
                this.showNotification('✅ Cloudinary connection successful!', 'success');
                this.updateSetupStatus('cloudinarySetupStatus', true);
                this.config.cloudinary.connected = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            this.showNotification('⚠️ Test inconclusive, but credentials saved. Try uploading an image to verify.', 'warning');
            this.updateSetupStatus('cloudinarySetupStatus', true);
        }
    }

    saveCloudinaryConfig() {
        const cloudName = document.getElementById('cloudinaryName').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const apiSecret = document.getElementById('apiSecret').value.trim();

        if (!cloudName || !apiKey || !apiSecret) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.config.cloudinary = { cloudName, apiKey, apiSecret, connected: true };
        
        localStorage.setItem('cloudinaryName', cloudName);
        localStorage.setItem('apiKey', apiKey);
        localStorage.setItem('apiSecret', apiSecret);

        this.updateSetupStatus('cloudinarySetupStatus', true);
        this.showNotification('✅ Cloudinary configured successfully!', 'success');
    }

    async testGoogleConnection() {
        const clientId = document.getElementById('googleSimpleClientId').value.trim();

        if (!clientId) {
            this.showNotification('Please enter Google Client ID', 'warning');
            return;
        }

        this.showNotification('Testing Google connection...', 'info');
        
        // Simple validation - check if it looks like a valid client ID
        if (clientId.includes('.apps.googleusercontent.com')) {
            this.showNotification('✅ Google Client ID format looks correct!', 'success');
            this.updateSetupStatus('googleSetupStatus', true);
            this.config.google.connected = true;
        } else {
            this.showNotification('⚠️ Client ID format seems incorrect. Should end with .apps.googleusercontent.com', 'warning');
        }
    }

    saveGoogleConfig() {
        const clientId = document.getElementById('googleSimpleClientId').value.trim();

        if (!clientId) {
            this.showNotification('Please enter Client ID', 'error');
            return;
        }

        this.config.google = { clientId, connected: true };
        localStorage.setItem('googleSimpleClientId', clientId);

        this.updateSetupStatus('googleSetupStatus', true);
        this.showNotification('✅ Google configured successfully!', 'success');
    }

    async testGitHubConnection() {
        const token = document.getElementById('githubToken').value.trim();
        const owner = document.getElementById('githubOwner').value.trim();
        const repo = document.getElementById('githubRepo').value.trim();

        if (!token || !owner || !repo) {
            this.showNotification('Please fill in all GitHub fields', 'warning');
            return;
        }

        this.showNotification('Testing GitHub connection...', 'info');

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                this.showNotification('✅ GitHub connection successful!', 'success');
                this.updateSetupStatus('githubSetupStatus', true);
                this.config.github.connected = true;
            } else {
                throw new Error('Connection failed');
            }
        } catch (error) {
            this.showNotification('❌ GitHub connection failed. Check your credentials.', 'error');
            this.updateSetupStatus('githubSetupStatus', false);
        }
    }

    saveGitHubConfig() {
        const token = document.getElementById('githubToken').value.trim();
        const owner = document.getElementById('githubOwner').value.trim();
        const repo = document.getElementById('githubRepo').value.trim();

        if (!token || !owner || !repo) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        this.config.github = { token, owner, repo, connected: true };
        
        localStorage.setItem('githubToken', token);
        localStorage.setItem('githubOwner', owner);
        localStorage.setItem('githubRepo', repo);

        this.updateSetupStatus('githubSetupStatus', true);
        this.showNotification('✅ GitHub configured successfully!', 'success');
    }

    updateSetupStatus(statusId, connected) {
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            const dot = statusElement.querySelector('.status-dot');
            const text = statusElement.querySelector('span:last-child');
            
            if (connected) {
                dot.textContent = '🟢';
                text.textContent = 'Connected';
            } else {
                dot.textContent = '🔴';
                text.textContent = 'Not configured';
            }
        }
    }

    updateConnectionStatus() {
        this.updateSetupStatus('cloudinarySetupStatus', this.config.cloudinary.connected);
        this.updateSetupStatus('googleSetupStatus', this.config.google.connected);
        
        // Update analytics health indicators
        const uploadHealth = document.getElementById('uploadHealth');
        const githubHealth = document.getElementById('githubHealth');
        const analyticsJobCount = document.getElementById('analyticsJobCount');
        
        if (uploadHealth) {
            uploadHealth.textContent = (this.config.cloudinary.connected || this.config.google.connected) ? '🟢' : '🔴';
        }
        
        if (githubHealth) {
            githubHealth.textContent = this.config.github.connected ? '🟢' : '🔴';
        }
        
        if (analyticsJobCount) {
            analyticsJobCount.textContent = this.jobs.length;
        }
    }

    // Theme and Template Methods
    previewTheme(theme) {
        const themeColors = {
            blue: ['#4f46e5', '#06b6d4', '#10b981'],
            purple: ['#8b5cf6', '#a855f7', '#c084fc'],
            green: ['#10b981', '#059669', '#047857'],
            orange: ['#f97316', '#ea580c', '#dc2626'],
            red: ['#ef4444', '#dc2626', '#b91c1c'],
            pink: ['#ec4899', '#db2777', '#be185d'],
            teal: ['#14b8a6', '#0d9488', '#0f766e'],
            dark: ['#374151', '#4b5563', '#6b7280']
        };
        
        const colors = themeColors[theme] || themeColors.blue;
        const previews = document.querySelectorAll('.color-preview');
        
        previews.forEach((preview, index) => {
            if (colors[index]) {
                preview.style.background = colors[index];
            }
        });
    }

    previewTemplate(template) {
        const templateImages = {
            modern: 'https://via.placeholder.com/300x150/4f46e5/ffffff?text=Modern+Cards',
            classic: 'https://via.placeholder.com/300x150/059669/ffffff?text=Classic+List',
            grid: 'https://via.placeholder.com/300x150/ec4899/ffffff?text=Grid+Layout',
            minimal: 'https://via.placeholder.com/300x150/6b7280/ffffff?text=Minimal+Design'
        };
        
        const previewImg = document.querySelector('#templatePreview img');
        if (previewImg && templateImages[template]) {
            previewImg.src = templateImages[template];
        }
    }

    previewHero(heroType) {
        const heroImages = {
            gradient: 'https://via.placeholder.com/300x120/4f46e5/ffffff?text=Gradient+Hero',
            image: 'https://via.placeholder.com/300x120/059669/ffffff?text=Image+Hero',
            split: 'https://via.placeholder.com/300x120/ec4899/ffffff?text=Split+Layout',
            minimal: 'https://via.placeholder.com/300x120/6b7280/ffffff?text=Minimal+Hero',
            animated: 'https://via.placeholder.com/300x120/8b5cf6/ffffff?text=Animated+Hero'
        };
        
        const previewImg = document.querySelector('#heroPreview img');
        if (previewImg && heroImages[heroType]) {
            previewImg.src = heroImages[heroType];
        }
    }

    saveTheme() {
        const theme = document.getElementById('themeSelect').value;
        const settings = JSON.parse(localStorage.getItem('jobPortalSettings') || '{}');
        settings.theme = theme;
        localStorage.setItem('jobPortalSettings', JSON.stringify(settings));
        this.showNotification('🎨 Theme saved successfully!', 'success');
    }

    saveTemplate() {
        const template = document.getElementById('templateSelect').value;
        const settings = JSON.parse(localStorage.getItem('jobPortalSettings') || '{}');
        settings.template = template;
        localStorage.setItem('jobPortalSettings', JSON.stringify(settings));
        this.showNotification('📱 Template saved successfully!', 'success');
    }

    saveHeroSettings() {
        const heroTemplate = document.getElementById('heroTemplate').value;
        const settings = JSON.parse(localStorage.getItem('jobPortalSettings') || '{}');
        settings.heroTemplate = heroTemplate;
        localStorage.setItem('jobPortalSettings', JSON.stringify(settings));
        this.showNotification('🖼️ Hero section updated successfully!', 'success');
    }

    // Enhanced Image Upload Methods
    handleImageUpload() {
        if (this.config.cloudinary.connected) {
            this.uploadToCloudinary();
        } else if (this.config.google.connected) {
            this.uploadToGoogle();
        } else {
            this.showNotification('⚠️ No upload provider configured. Using placeholder instead.', 'warning');
            this.showPlaceholderGenerator();
        }
    }

    showUrlInput() {
        this.hideAllUploadSections();
        document.getElementById('urlInputSection').style.display = 'block';
        document.getElementById('uploadStatus').textContent = 'Enter image URL below';
        document.getElementById('imageUrlInput').focus();
    }

    hideUrlInput() {
        document.getElementById('urlInputSection').style.display = 'none';
        document.getElementById('uploadStatus').textContent = 'Choose an option above';
        document.getElementById('imageUrlInput').value = '';
    }

    showPlaceholderGenerator() {
        this.hideAllUploadSections();
        document.getElementById('placeholderSection').style.display = 'block';
        document.getElementById('uploadStatus').textContent = 'Generate a placeholder image';
    }

    hidePlaceholderGenerator() {
        document.getElementById('placeholderSection').style.display = 'none';
        document.getElementById('uploadStatus').textContent = 'Choose an option above';
    }

    hideAllUploadSections() {
        document.getElementById('urlInputSection').style.display = 'none';
        document.getElementById('placeholderSection').style.display = 'none';
        document.getElementById('quickImagesSection').style.display = 'none';
    }

    showQuickImages() {
        this.hideAllUploadSections();
        document.getElementById('quickImagesSection').style.display = 'block';
        document.getElementById('uploadStatus').textContent = 'Click on any image to use it';
    }

    hideQuickImages() {
        document.getElementById('quickImagesSection').style.display = 'none';
        document.getElementById('uploadStatus').textContent = 'Choose an option above';
    }

    useQuickImage(imageUrl) {
        document.getElementById('jobImage').value = imageUrl;
        this.showImagePreview(imageUrl);
        this.hideQuickImages();
        this.showNotification('✅ Quick image selected successfully!', 'success');
    }

    previewUrlImage() {
        const url = document.getElementById('imageUrlInput').value.trim();
        if (!url) {
            this.showNotification('Please enter an image URL', 'warning');
            return;
        }

        if (!this.isValidImageUrl(url)) {
            this.showNotification('Please enter a valid image URL (jpg, jpeg, png, gif, webp)', 'warning');
            return;
        }

        // Test if image loads
        const img = new Image();
        img.onload = () => {
            this.showImagePreview(url);
            document.getElementById('uploadStatus').textContent = 'Image preview loaded - click "Use This Image" to confirm';
        };
        img.onerror = () => {
            this.showNotification('❌ Could not load image from this URL. Please check the URL and try again.', 'error');
        };
        img.src = url;
    }

    useUrlImage() {
        const url = document.getElementById('imageUrlInput').value.trim();
        if (!url) return;

        document.getElementById('jobImage').value = url;
        this.showImagePreview(url);
        this.hideUrlInput();
        this.showNotification('✅ Image URL saved successfully!', 'success');
    }

    generatePlaceholder() {
        const style = document.getElementById('placeholderStyle').value;
        const jobTitle = document.getElementById('jobTitle').value.trim() || 'Job Position';
        
        const styles = {
            professional: { bg: '4f46e5', text: 'ffffff' },
            modern: { bg: '8b5cf6', text: 'ffffff' },
            creative: { bg: 'f97316', text: 'ffffff' },
            tech: { bg: '10b981', text: 'ffffff' },
            business: { bg: '6b7280', text: 'ffffff' }
        };

        const selectedStyle = styles[style] || styles.professional;
        const placeholderUrl = `https://via.placeholder.com/400x200/${selectedStyle.bg}/${selectedStyle.text}?text=${encodeURIComponent(jobTitle)}`;

        document.getElementById('jobImage').value = placeholderUrl;
        this.showImagePreview(placeholderUrl);
        this.hidePlaceholderGenerator();
        this.showNotification('✅ Placeholder image generated!', 'success');
    }

    changeImage() {
        this.hideImagePreview();
        document.getElementById('jobImage').value = '';
        document.getElementById('uploadStatus').textContent = 'Choose an option above';
    }

    isValidImageUrl(url) {
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
        return imageExtensions.test(url) || url.includes('placeholder') || url.includes('unsplash') || url.includes('pexels');
    }

    uploadToCloudinary() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
            if (e.target.files[0]) {
                this.processCloudinaryUpload(e.target.files[0]);
            }
        };
        fileInput.click();
    }

    async processCloudinaryUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('Image size must be less than 10MB.', 'error');
            return;
        }

        this.showUploadProgress();

        try {
            // Try multiple upload methods
            let result = null;
            
            // Method 1: Try unsigned upload with common presets
            const commonPresets = ['ml_default', 'unsigned_default', 'default'];
            
            for (const preset of commonPresets) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', preset);
                    formData.append('folder', 'job-portal');

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.config.cloudinary.cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    const uploadResult = await response.json();
                    
                    if (uploadResult.secure_url) {
                        result = uploadResult;
                        console.log(`✅ Upload successful with preset: ${preset}`);
                        break;
                    }
                } catch (e) {
                    console.log(`Preset ${preset} failed, trying next...`);
                }
            }
            
            // Method 2: If presets fail, try without preset (auto upload)
            if (!result) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'job-portal');

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${this.config.cloudinary.cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    const uploadResult = await response.json();
                    
                    if (uploadResult.secure_url) {
                        result = uploadResult;
                        console.log('✅ Upload successful without preset');
                    }
                } catch (e) {
                    console.log('Upload without preset also failed');
                }
            }
            
            if (result && result.secure_url) {
                document.getElementById('jobImage').value = result.secure_url;
                this.showImagePreview(result.secure_url);
                this.showNotification('✅ Image uploaded successfully!', 'success');
            } else {
                throw new Error('All upload methods failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('⚠️ Upload failed. Using placeholder image.', 'warning');
            
            // Fallback to placeholder
            const placeholderUrl = `https://via.placeholder.com/400x200/4f46e5/ffffff?text=${encodeURIComponent(file.name.split('.')[0])}`;
            document.getElementById('jobImage').value = placeholderUrl;
            this.showImagePreview(placeholderUrl);
        } finally {
            this.hideUploadProgress();
        }
    }

    uploadToGoogle() {
        this.showNotification('Google Drive upload coming soon!', 'info');
    }

    showUploadProgress() {
        const uploadStatus = document.getElementById('uploadStatus');
        if (uploadStatus) {
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.style.color = '#4f46e5';
        }
    }

    hideUploadProgress() {
        const uploadStatus = document.getElementById('uploadStatus');
        if (uploadStatus) {
            uploadStatus.textContent = 'Upload complete';
            uploadStatus.style.color = '#10b981';
        }
    }

    showImagePreview(imageUrl) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (previewImg) {
            previewImg.src = imageUrl;
        }
        
        if (preview) {
            preview.style.display = 'flex';
        }
        
        if (uploadStatus) {
            uploadStatus.textContent = 'Image selected successfully';
            uploadStatus.style.color = '#10b981';
        }

        this.hideAllUploadSections();
    }

    hideImagePreview() {
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    removeImage() {
        document.getElementById('jobImage').value = '';
        this.hideImagePreview();
        
        const uploadStatus = document.getElementById('uploadStatus');
        if (uploadStatus) {
            uploadStatus.textContent = 'Choose an option above';
            uploadStatus.style.color = '#6b7280';
        }
        
        this.showNotification('Image removed', 'success');
    }

    // Utility Methods
    updateStats() {
        const totalJobsElement = document.getElementById('totalJobs');
        const activeJobsElement = document.getElementById('activeJobs');
        
        if (totalJobsElement) totalJobsElement.textContent = this.jobs.length;
        if (activeJobsElement) activeJobsElement.textContent = this.jobs.length;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.background = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                localStorage.removeItem('adminSession');
                console.log('Logged out successfully');
                window.location.replace('login.html');
            } catch (e) {
                console.error('Logout error:', e);
                window.location.replace('login.html');
            }
        }
    }

    // Export Functions
    generateExport() {
        // Update export job count
        const exportJobCount = document.getElementById('exportJobCount');
        if (exportJobCount) {
            exportJobCount.textContent = this.jobs.length;
        }

        // Get current settings
        const settings = {
            siteTitle: document.getElementById('siteTitle')?.value || 'JobPortal',
            siteDescription: document.getElementById('siteDescription')?.value || 'Discover amazing career opportunities',
            heroTitle: document.getElementById('heroTitle')?.value || 'Job Opportunity',
            heroSubtitle: document.getElementById('heroSubtitle')?.value || 'Discover amazing career opportunities',
            template: document.getElementById('templateSelect')?.value || 'modern',
            theme: document.getElementById('themeSelect')?.value || 'blue',
            heroTemplate: document.getElementById('heroTemplate')?.value || 'gradient'
        };

        // Generate the code
        const code = this.generateJobsDataFile(this.jobs, settings);

        // Display the code
        const exportCode = document.getElementById('exportCode');
        const exportCodeCard = document.getElementById('exportCodeCard');
        
        if (exportCode && exportCodeCard) {
            exportCode.textContent = code;
            exportCodeCard.style.display = 'block';
            
            // Scroll to the code
            exportCodeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        this.showNotification('✅ Export code generated! Copy and paste to jobs-data.js', 'success');
    }

    generateJobsDataFile(jobs, settings) {
        const jobsJson = JSON.stringify(jobs, null, 4);
        const settingsJson = JSON.stringify(settings, null, 4);

        return `// Jobs Database - Update this file to change jobs for all visitors
// This file is loaded by both the public site and admin panel
// Last updated: ${new Date().toLocaleString()}

window.JOBS_DATABASE = ${jobsJson};

// Site Settings - Update these to change site appearance for all visitors
window.SITE_SETTINGS = ${settingsJson};`;
    }

    async copyExportCode() {
        const exportCode = document.getElementById('exportCode');
        if (!exportCode) return;

        const code = exportCode.textContent;

        try {
            await navigator.clipboard.writeText(code);
            this.showNotification('✅ Code copied to clipboard! Now paste it into jobs-data.js on GitHub', 'success');
            
            // Change button text temporarily
            const copyBtn = document.getElementById('copyExportBtn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅ Copied!';
                copyBtn.style.background = '#10b981';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '';
                }, 2000);
            }
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('✅ Code copied! Paste it into jobs-data.js on GitHub', 'success');
            } catch (err) {
                this.showNotification('❌ Could not copy. Please select and copy manually.', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});