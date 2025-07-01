function publicRecordsApp() {
    return {
        // Form data
        form: {
            requesterName: '',
            requesterEmail: '',
            requesterPhone: '',
            requesterOrganization: '',
            requesterAddress: '',
            state: '',
            agencyName: '',
            agencyDepartment: '',
            agencyContact: '',
            agencyAddress: '',
            subject: '',
            recordsDescription: '',
            dateFrom: '',
            dateTo: '',
            preferredFormat: 'electronic',
            expeditedProcessing: false,
            feeWaiverRequest: false,
            publicInterest: false,
            additionalNotes: ''
        },
        
        // Data
        states: [],
        laws: [],
        templates: [],
        selectedTemplate: '',
        selectedLaw: null,
        customTemplates: [],
        
        // Template Wizard
        showTemplateWizard: false,
        showTemplateManager: false,
        wizardStep: 1,
        customTemplate: {
            id: '',
            name: '',
            category: 'general',
            description: '',
            subject: '',
            recordsDescription: '',
            preferredFormat: '',
            agencyType: '',
            expeditedProcessing: false,
            feeWaiverRequest: false,
            publicInterest: false,
            additionalNotes: ''
        },
        
        // Dark mode
        darkMode: false,
        
        // Initialize the application
        async init() {
            await this.loadData();
            this.loadCustomTemplates();
            this.setupFormValidation();
            this.initDarkMode();
            
            // Debug: Verify template wizard variables are initialized
            console.log('Template wizard initialized:', {
                showTemplateWizard: this.showTemplateWizard,
                wizardStep: this.wizardStep,
                customTemplate: this.customTemplate
            });
        },
        
        // Load external data
        async loadData() {
            try {
                const [statesResponse, lawsResponse, templatesResponse] = await Promise.all([
                    fetch('data/states.json'),
                    fetch('data/laws.json'),
                    fetch('data/templates.json')
                ]);
                
                this.states = await statesResponse.json();
                this.laws = await lawsResponse.json();
                this.templates = await templatesResponse.json();
            } catch (error) {
                console.error('Error loading data:', error);
                this.showError('Failed to load application data. Please refresh the page.');
            }
        },
        
        // Apply selected template
        applyTemplate() {
            if (!this.selectedTemplate) return;
            
            // Check if it's a custom template
            if (this.selectedTemplate.startsWith('custom_')) {
                const customId = this.selectedTemplate.replace('custom_', '');
                const template = this.customTemplates.find(t => t.id === customId);
                if (template) {
                    this.form.subject = template.subject;
                    this.form.recordsDescription = template.recordsDescription;
                    this.form.preferredFormat = template.preferredFormat || this.form.preferredFormat;
                    this.form.expeditedProcessing = template.expeditedProcessing || false;
                    this.form.feeWaiverRequest = template.feeWaiverRequest || false;
                    this.form.publicInterest = template.publicInterest || false;
                    this.form.additionalNotes = template.additionalNotes || '';
                    if (template.agencyType) {
                        this.form.agencyName = template.agencyType;
                    }
                    this.showNotification(`Applied custom template: ${template.name}`, 'success');
                }
            } else {
                // Built-in template
                const template = this.templates.find(t => t.id === this.selectedTemplate);
                if (template) {
                    this.form.subject = template.subject;
                    this.form.recordsDescription = template.description;
                    this.form.expeditedProcessing = template.expedited || false;
                    this.form.feeWaiverRequest = template.feeWaiver || false;
                    this.form.publicInterest = template.publicInterest || false;
                    this.showNotification(`Applied template: ${template.name}`, 'success');
                }
            }
        },
        
        // Handle state selection
        onStateChange() {
            if (!this.form.state) {
                this.selectedLaw = null;
                return;
            }
            
            this.selectedLaw = this.laws.find(law => law.code === this.form.state);
            this.showNotification(
                `Legal information updated for ${this.selectedLaw?.name || 'selected state'}`,
                'success'
            );
        },
        
        // Get current date formatted
        getCurrentDate() {
            const now = new Date();
            return now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        // Format date for display
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        // Get state citation
        getStateCitation() {
            if (!this.selectedLaw) return 'applicable state public records laws';
            return this.selectedLaw.fullCitation;
        },
        
        // Get legal requirements text
        getLegalRequirements() {
            if (!this.selectedLaw) {
                return 'Please respond to this request within the timeframe required by applicable law.';
            }
            
            let text = `Under ${this.selectedLaw.fullCitation}, you are required to respond to this request within ${this.selectedLaw.responseTime}. `;
            
            if (this.selectedLaw.feeStructure) {
                text += `${this.selectedLaw.feeDetails} `;
            }
            
            if (this.selectedLaw.denialRights) {
                text += `${this.selectedLaw.denialProcess}`;
            }
            
            return text;
        },
        
        // Get format preference text
        getFormatPreference() {
            switch (this.form.preferredFormat) {
                case 'electronic': return 'electronic';
                case 'paper': return 'paper copy';
                case 'inspection': return 'inspection only';
                default: return 'electronic';
            }
        },
        
        // Update state citation when state changes
        updateStateCitation() {
            // This method is called when state selection changes
            // The citation will be automatically updated in the preview
        },
        
        // Dark mode functionality
        initDarkMode() {
            // Check for saved theme preference or default to light mode
            const savedTheme = localStorage.getItem('darkMode');
            if (savedTheme) {
                this.darkMode = savedTheme === 'true';
            } else {
                // Check system preference
                this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
        },
        
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode.toString());
            this.showNotification(
                this.darkMode ? 'Dark mode enabled' : 'Light mode enabled',
                'success'
            );
        },
        
        // Copy letter to clipboard
        async copyToClipboard() {
            try {
                const letterText = this.generateLetterText();
                await navigator.clipboard.writeText(letterText);
                this.showSuccess('Letter copied to clipboard successfully!');
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                this.showError('Failed to copy to clipboard. Please try selecting and copying the text manually.');
            }
        },
        
        // Export as text file
        exportAsText() {
            try {
                const letterText = this.generateLetterText();
                const blob = new Blob([letterText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `public-records-request-${this.getCurrentDateForFilename()}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                this.showSuccess('Text file downloaded successfully!');
            } catch (error) {
                console.error('Failed to export as text:', error);
                this.showError('Failed to export as text file.');
            }
        },
        
        // Export as PDF
        exportAsPDF() {
            try {
                generatePDF(this.generateLetterText(), this.form);
                this.showSuccess('PDF generated successfully!');
            } catch (error) {
                console.error('Failed to export as PDF:', error);
                this.showError('Failed to export as PDF.');
            }
        },
        
        // Generate letter text
        generateLetterText() {
            let letter = '';
            
            // Date
            letter += `${this.getCurrentDate()}\n\n`;
            
            // Agency address
            if (this.form.agencyContact) letter += `${this.form.agencyContact}\n`;
            if (this.form.agencyName) letter += `${this.form.agencyName}\n`;
            if (this.form.agencyDepartment) letter += `${this.form.agencyDepartment}\n`;
            if (this.form.agencyAddress) letter += `${this.form.agencyAddress}\n`;
            letter += '\n';
            
            // Subject
            letter += `RE: ${this.form.subject || 'Public Records Request'}\n\n`;
            
            // Salutation
            if (this.form.agencyContact) {
                letter += `Dear ${this.form.agencyContact},\n\n`;
            } else {
                letter += `To Whom It May Concern:\n\n`;
            }
            
            // Opening paragraph
            letter += `I am writing to request access to public records under ${this.getStateCitation()}. `;
            if (this.form.requesterOrganization) {
                letter += `I am making this request on behalf of ${this.form.requesterOrganization}. `;
            }
            letter += '\n\n';
            
            // Records description
            letter += 'Specifically, I am requesting:\n\n';
            letter += `${this.form.recordsDescription || 'Please describe the records you are requesting...'}\n\n`;
            
            // Date range
            if (this.form.dateFrom || this.form.dateTo) {
                letter += 'Date Range: ';
                if (this.form.dateFrom && this.form.dateTo) {
                    letter += `${this.formatDate(this.form.dateFrom)} to ${this.formatDate(this.form.dateTo)}`;
                } else if (this.form.dateFrom) {
                    letter += `From ${this.formatDate(this.form.dateFrom)}`;
                } else if (this.form.dateTo) {
                    letter += `Through ${this.formatDate(this.form.dateTo)}`;
                }
                letter += '\n\n';
            }
            
            // Format preference
            if (this.form.preferredFormat) {
                letter += `I would prefer to receive these records in ${this.getFormatPreference()} format.\n\n`;
            }
            
            // Fee waiver
            if (this.form.feeWaiverRequest) {
                letter += 'I request that any fees associated with this request be waived as this information is being sought in the public interest and will contribute to public understanding of government operations.\n\n';
            }
            
            // Expedited processing
            if (this.form.expeditedProcessing) {
                letter += 'I request expedited processing of this request due to its time-sensitive nature.\n\n';
            }
            
            // Additional notes
            if (this.form.additionalNotes) {
                letter += `${this.form.additionalNotes}\n\n`;
            }
            
            // Legal requirements
            letter += `${this.getLegalRequirements()}\n\n`;
            
            // Contact information
            letter += `If you have any questions about this request, please contact me at ${this.form.requesterEmail || 'your-email@example.com'}`;
            if (this.form.requesterPhone) {
                letter += ` or ${this.form.requesterPhone}`;
            }
            letter += '.\n\n';
            
            // Closing
            letter += 'Thank you for your time and consideration.\n\n';
            letter += 'Sincerely,\n\n';
            
            // Signature block
            letter += `${this.form.requesterName || 'Your Name'}\n`;
            if (this.form.requesterOrganization) {
                letter += `${this.form.requesterOrganization}\n`;
            }
            if (this.form.requesterAddress) {
                letter += `${this.form.requesterAddress}\n`;
            }
            letter += `${this.form.requesterEmail || 'your-email@example.com'}\n`;
            if (this.form.requesterPhone) {
                letter += `${this.form.requesterPhone}\n`;
            }
            
            return letter;
        },
        
        // Get current date for filename
        getCurrentDateForFilename() {
            const now = new Date();
            return now.toISOString().split('T')[0];
        },
        
        // Start over - reset form
        startOver() {
            if (confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
                this.form = {
                    requesterName: '',
                    requesterEmail: '',
                    requesterPhone: '',
                    requesterOrganization: '',
                    requesterAddress: '',
                    state: '',
                    agencyName: '',
                    agencyDepartment: '',
                    agencyContact: '',
                    agencyAddress: '',
                    subject: '',
                    recordsDescription: '',
                    dateFrom: '',
                    dateTo: '',
                    preferredFormat: 'electronic',
                    expeditedProcessing: false,
                    feeWaiverRequest: false,
                    publicInterest: false,
                    additionalNotes: ''
                };
                this.selectedTemplate = '';
                this.showSuccess('Form cleared successfully!');
            }
        },
        
        // Form validation
        setupFormValidation() {
            // Basic client-side validation
            const requiredFields = ['requesterName', 'requesterEmail', 'state', 'agencyName', 'subject', 'recordsDescription'];
            
            // You can add more sophisticated validation here
        },
        
        // Show success message
        showSuccess(message) {
            this.showNotification(message, 'success');
        },
        
        // Show error message
        showError(message) {
            this.showNotification(message, 'error');
        },
        
        // Show notification
        showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${
                type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 5000);
        },

        // Template Wizard Functions
        loadCustomTemplates() {
            const saved = localStorage.getItem('customTemplates');
            if (saved) {
                try {
                    this.customTemplates = JSON.parse(saved);
                } catch (error) {
                    console.error('Error loading custom templates:', error);
                    this.customTemplates = [];
                }
            }
        },

        saveCustomTemplates() {
            localStorage.setItem('customTemplates', JSON.stringify(this.customTemplates));
        },

        closeTemplateWizard() {
            this.showTemplateWizard = false;
            this.wizardStep = 1;
            this.resetCustomTemplate();
        },

        openTemplateWizard() {
            this.resetCustomTemplate();
            this.wizardStep = 1;
            this.showTemplateWizard = true;
        },

        resetCustomTemplate() {
            this.customTemplate = {
                id: '',
                name: '',
                category: 'general',
                description: '',
                subject: '',
                recordsDescription: '',
                preferredFormat: '',
                agencyType: '',
                expeditedProcessing: false,
                feeWaiverRequest: false,
                publicInterest: false,
                additionalNotes: ''
            };
        },

        saveCustomTemplate() {
            // Validation
            if (!this.customTemplate.name.trim()) {
                this.showError('Please enter a template name.');
                return;
            }
            if (!this.customTemplate.subject.trim()) {
                this.showError('Please enter a subject template.');
                return;
            }
            if (!this.customTemplate.recordsDescription.trim()) {
                this.showError('Please enter a records description template.');
                return;
            }

            // Check for duplicate names
            const existingTemplate = this.customTemplates.find(t => 
                t.name.toLowerCase() === this.customTemplate.name.trim().toLowerCase()
            );
            if (existingTemplate) {
                if (!confirm('A template with this name already exists. Do you want to overwrite it?')) {
                    return;
                }
                // Remove existing template
                this.customTemplates = this.customTemplates.filter(t => t.id !== existingTemplate.id);
            }

            // Generate ID
            const templateId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            
            // Create template object
            const newTemplate = {
                ...this.customTemplate,
                id: templateId,
                name: this.customTemplate.name.trim(),
                createdAt: new Date().toISOString(),
                lastUsed: null
            };

            // Add to custom templates
            this.customTemplates.push(newTemplate);
            this.saveCustomTemplates();

            // Close wizard and show success
            this.closeTemplateWizard();
            this.showSuccess(`Custom template "${newTemplate.name}" saved successfully!`);
        },

        deleteCustomTemplate(templateId) {
            if (confirm('Are you sure you want to delete this custom template? This action cannot be undone.')) {
                this.customTemplates = this.customTemplates.filter(t => t.id !== templateId);
                this.saveCustomTemplates();
                this.showSuccess('Custom template deleted successfully!');
                
                // Clear selection if this template was selected
                if (this.selectedTemplate === `custom_${templateId}`) {
                    this.selectedTemplate = '';
                }
            }
        },

        editCustomTemplate(templateId) {
            const template = this.customTemplates.find(t => t.id === templateId);
            if (template) {
                this.customTemplate = { ...template };
                this.showTemplateWizard = true;
                this.wizardStep = 1;
            }
        },

        duplicateCustomTemplate(templateId) {
            const template = this.customTemplates.find(t => t.id === templateId);
            if (template) {
                this.customTemplate = { 
                    ...template, 
                    id: '',
                    name: `${template.name} (Copy)`,
                    createdAt: '',
                    lastUsed: null
                };
                this.showTemplateWizard = true;
                this.wizardStep = 1;
            }
        }
    };
}
