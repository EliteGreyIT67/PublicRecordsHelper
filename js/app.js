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
        templates: [],
        selectedTemplate: '',
        
        // Initialize the application
        async init() {
            await this.loadData();
            this.setupFormValidation();
        },
        
        // Load external data
        async loadData() {
            try {
                const [statesResponse, templatesResponse] = await Promise.all([
                    fetch('data/states.json'),
                    fetch('data/templates.json')
                ]);
                
                this.states = await statesResponse.json();
                this.templates = await templatesResponse.json();
            } catch (error) {
                console.error('Error loading data:', error);
                this.showError('Failed to load application data. Please refresh the page.');
            }
        },
        
        // Apply selected template
        applyTemplate() {
            if (!this.selectedTemplate) return;
            
            const template = this.templates.find(t => t.id === this.selectedTemplate);
            if (template) {
                this.form.subject = template.subject;
                this.form.recordsDescription = template.description;
                this.form.expeditedProcessing = template.expedited || false;
                this.form.feeWaiverRequest = template.feeWaiver || false;
                this.form.publicInterest = template.publicInterest || false;
            }
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
            if (!this.form.state) return 'applicable state public records laws';
            
            const state = this.states.find(s => s.code === this.form.state);
            return state ? state.citation : 'applicable state public records laws';
        },
        
        // Get legal requirements text
        getLegalRequirements() {
            if (!this.form.state) {
                return 'Please respond to this request within the timeframe required by applicable law.';
            }
            
            const state = this.states.find(s => s.code === this.form.state);
            if (!state) {
                return 'Please respond to this request within the timeframe required by applicable law.';
            }
            
            let text = `Under ${state.citation}, you are required to respond to this request within ${state.responseTime}. `;
            
            if (state.feeStructure) {
                text += `If there are any fees associated with this request, please provide a detailed breakdown of costs before proceeding. `;
            }
            
            if (state.denyalRights) {
                text += `If any portion of this request is denied, please cite the specific legal authority for the denial and advise me of my appeal rights.`;
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
        }
    };
}
