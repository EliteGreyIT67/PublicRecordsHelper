function publicRecordsApp() {
    return {
        // --- STATE PROPERTIES --- //
        form: {},
        laws: [],
        templates: [],
        customTemplates: [],
        selectedTemplate: '',
        selectedLaw: null,
        notifications: [],
        notificationCounter: 0,
        confirmModal: { open: false, title: '', body: '', onConfirm: () => {}, confirmText: 'Confirm', confirmClass: 'bg-red-600 hover:bg-red-700' },
        showTemplateWizard: false,
        customTemplate: {},
        currentLang: 'en',
        locales: {},
        isLoading: false, // For Gemini API calls
        progress: 0,

        // --- INITIALIZATION --- //
        async init() {
            this.resetForm();
            this.resetCustomTemplate();
            await this.loadData(); // Load external JSON
            this.initLanguage();
            this.loadCustomTemplatesFromStorage();
            this.$watch('form', () => {
                this.updatePreview();
                this.updateProgress();
            }, { deep: true });
            this.updatePreview();
            this.updateProgress();
            console.log("Public Records Helper Initialized.");
        },

        resetForm() {
            this.form = {
                requesterName: '', requesterEmail: '', requesterPhone: '',
                requesterOrganization: '', requesterAddress: '', state: '',
                agencyName: '', agencyDepartment: '', agencyContact: '',
                agencyAddress: '', subject: '', recordsDescription: '',
                dateFrom: '', dateTo: '', preferredFormat: 'electronic',
                expeditedProcessing: false, feeWaiverRequest: false, additionalNotes: ''
            };
            this.selectedTemplate = '';
            this.selectedLaw = null;
        },

        async loadData() {
            try {
                const [lawsResponse, templatesResponse, enLocaleResponse, esLocaleResponse] = await Promise.all([
                    fetch('data/laws.json'),
                    fetch('data/templates.json'),
                    fetch('locales/en.json'),
                    fetch('locales/es.json')
                ]);
                this.laws = await lawsResponse.json();
                this.templates = await templatesResponse.json();
                const enLocale = await enLocaleResponse.json();
                const esLocale = await esLocaleResponse.json();

                // Combine fetched locales with hardcoded fallbacks
                this.locales = {
                    en: {...this.getHardcodedLocales().en, ...enLocale},
                    es: {...this.getHardcodedLocales().es, ...esLocale}
                };

            } catch (error) {
                console.error('Error loading application data:', error);
                this.showNotification('Failed to load application data. Please refresh.', 'error');
            }
        },
        
        getHardcodedLocales() {
            // This is a fallback in case the locale files are not complete or fail to load
            return {
                en: {"appTitle":"Public Records Request Generator","appSubtitle":"Craft professional requests with state-specific legal citations.","requestDetails":"Request Details","jurisdiction":"Jurisdiction","selectState":"Select Your State (Required)","chooseState":"Choose your state...","requestTemplate":"Request Template","quickStartTemplates":"Quick Start Templates","createCustom":"Create Custom","selectTemplate":"Select a template...","builtInTemplates":"Built-in Templates","myCustomTemplates":"My Custom Templates","yourInformation":"Your Information","fullName":"Full Name *","fullNamePlaceholder":"John Doe","emailAddress":"Email Address *","emailAddressPlaceholder":"john@example.com","phoneNumber":"Phone Number","phoneNumberPlaceholder":"(555) 123-4567","organization":"Organization (if applicable)","organizationPlaceholder":"News Organization","mailingAddress":"Mailing Address","mailingAddressPlaceholder":"123 Main St, City, State 12345","previewExport":"Preview & Export","copyAsText":"Copy as Text","downloadAsTXT":"Download as TXT","exportAsPDF":"Export as PDF","startOver":"Start Over","police_report":"Police Report","animal_welfare":"Animal Welfare Records","government_contracts":"Government Contracts","financial_records":"Financial Records","meeting_records":"Meeting Records","employment_records":"Employment Records","property_records":"Property Records","permits_licenses":"Permits and Licenses", "recordsDescription": "Records Description", "describeRecords": "Describe the records you are requesting in detail.", "describeRecordsPlaceholder": "e.g., All emails between Mayor John Smith and City Manager Jane Doe from January 1, 2023, to March 31, 2023, regarding the downtown development project.", "refineWithAI": "Refine with AI", "getAISuggestions": "Get AI Suggestions", "loading": "Loading...", "progress": "Progress", "lawGuide": "Law Quick Guide", "citation": "Citation", "responseTime": "Response Time", "denialProcess": "Denial/Appeal Process", "options": "Options", "requestFeeWaiver": "Request a Fee Waiver", "feeWaiverDescription": "Check this if your request is in the public interest.", "generateWaiverText": "Generate Waiver Text with AI"},
                es: {"appTitle":"Generador de Solicitudes de Registros Públicos","appSubtitle":"Cree solicitudes profesionales con citas legales específicas del estado.","requestDetails":"Detalles de la Solicitud","jurisdiction":"Jurisdicción","selectState":"Seleccione su Estado (Requerido)","chooseState":"Elija su estado...","requestTemplate":"Plantilla de Solicitud","quickStartTemplates":"Plantillas Rápidas","createCustom":"Crear Personalizada","selectTemplate":"Seleccione una plantilla...","builtInTemplates":"Plantillas Incorporadas","myCustomTemplates":"Mis Plantillas Personalizadas","yourInformation":"Su Información","fullName":"Nombre Completo *","fullNamePlaceholder":"Juan Pérez","emailAddress":"Correo Electrónico *","emailAddressPlaceholder":"juan@ejemplo.com","phoneNumber":"Número de Teléfono","phoneNumberPlaceholder":"(555) 123-4567","organization":"Organización (si aplica)","organizationPlaceholder":"Organización de Noticias","mailingAddress":"Dirección Postal","mailingAddressPlaceholder":"123 Calle Principal, Ciudad, Estado 12345","previewExport":"Vista Previa y Exportar","copyAsText":"Copiar como Texto","downloadAsTXT":"Descargar como TXT","exportAsPDF":"Exportar como PDF","startOver":"Empezar de Nuevo","police_report":"Informe de Policía","animal_welfare":"Registros de Bienestar Animal","government_contracts":"Contratos Gubernamentales","financial_records":"Registros Financieros","meeting_records":"Actas de Reuniones","employment_records":"Registros de Empleo","property_records":"Registros de Propiedad","permits_licenses":"Permisos y Licencias", "recordsDescription": "Descripción de los Registros", "describeRecords": "Describa los registros que solicita en detalle.", "describeRecordsPlaceholder": "Ej: Todos los correos electrónicos entre el alcalde John Smith y la administradora de la ciudad Jane Doe desde el 1 de enero de 2023 hasta el 31 de marzo de 2023, sobre el proyecto de desarrollo del centro.", "refineWithAI": "Refinar con IA", "getAISuggestions": "Obtener Sugerencias de IA", "loading": "Cargando...", "progress": "Progreso", "lawGuide": "Guía Rápida de Leyes", "citation": "Citación", "responseTime": "Tiempo de Respuesta", "denialProcess": "Proceso de Apelación", "options": "Opciones", "requestFeeWaiver": "Solicitar Exención de Tarifas", "feeWaiverDescription": "Marque esto si su solicitud es de interés público.", "generateWaiverText": "Generar Texto de Exención con IA"}
            };
        },

        // --- LANGUAGE --- //
        initLanguage() {
            const savedLang = localStorage.getItem('appLanguage') || 'en';
            this.setLang(savedLang);
        },
        setLang(lang) {
            this.currentLang = this.locales[lang] ? lang : 'en';
            localStorage.setItem('appLanguage', this.currentLang);
            document.documentElement.lang = this.currentLang;
        },
        t(key, fallback = '') {
            return this.locales[this.currentLang]?.[key] || fallback || key;
        },

        // --- DYNAMIC PREVIEW --- //
        updatePreview(){
            // The preview is now handled reactively by x-html, so this method is a placeholder
        },
        
        updateProgress() {
            let completed = 0;
            const total = 4; // Number of fields to track for progress
            if (this.form.state) completed++;
            if (this.form.requesterName.trim()) completed++;
            if (this.form.requesterEmail.trim()) completed++;
            if (this.form.recordsDescription.trim()) completed++;
            this.progress = Math.round((completed / total) * 100);
        },

        generateLetterHTML() {
            const h = (tag, content, classes = '') => `<${tag} class="${classes}">${content}</${tag}>`;
            let html = '';
            html += h('div', this.getCurrentDate(), 'mb-8 text-right');
            html += `<div class="mb-8">
                        ${this.form.agencyContact ? h('div', this.form.agencyContact) : ''}
                        ${this.form.agencyName ? h('div', this.form.agencyName) : ''}
                        ${this.form.agencyDepartment ? h('div', this.form.agencyDepartment) : ''}
                        ${this.form.agencyAddress ? this.form.agencyAddress.replace(/\n/g, '<br>') : ''}
                    </div>`;
            html += h('div', `<strong>RE: ${this.form.subject || '[Subject Line]'}</strong>`, 'mb-6');
            html += h('div', `Dear ${this.form.agencyContact || 'Records Officer'},`, 'mb-4');
            html += h('div', `I am writing to request access to public records under <span class="font-semibold">${this.getStateCitation()}</span>. ${this.form.requesterOrganization ? `I am making this request on behalf of ${this.form.requesterOrganization}.` : ''}`, 'mb-4');
            html += h('div', '<strong>Specifically, I am requesting the following records:</strong>', 'mb-4');
            html += h('div', (this.form.recordsDescription || '[Please describe the records...]').replace(/\n/g, '<br>'), 'mb-4 pl-4 border-l-2 border-gray-300');
            if(this.getDateRangeText()) html += h('div', `<strong>Date Range:</strong> ${this.getDateRangeText()}`, 'mb-4');
            if(this.form.preferredFormat) html += h('div', `I would prefer to receive these records in <strong>${this.form.preferredFormat}</strong> format.`, 'mb-4');
            if (this.form.feeWaiverRequest && this.form.additionalNotes) {
                html += h('div', '<strong>Request for Fee Waiver:</strong>', 'mb-2 font-semibold');
                html += h('div', this.form.additionalNotes.replace(/\n/g, '<br>'), 'mb-4');
            } else if (this.form.feeWaiverRequest) {
                 html += h('div', '<strong>Request for Fee Waiver:</strong> I request that any fees associated with this request be waived as this information is being sought in the public interest.', 'mb-4');
            }
            html += h('div', this.getLegalRequirements(), 'mb-4 text-sm text-gray-600');
            html += h('div', `If you have any questions, please contact me at ${this.form.requesterEmail || '[email]'}${this.form.requesterPhone ? ` or ${this.form.requesterPhone}` : ''}.`, 'mb-4');
            html += h('div', 'Thank you for your time and consideration.', 'mb-6');
            html += h('div', 'Sincerely,', 'mb-4');
            html += `<div class="mt-12">
                        <div>${this.form.requesterName || '[Your Name]'}</div>
                        ${this.form.requesterOrganization ? `<div>${this.form.requesterOrganization}</div>` : ''}
                    </div>`;
            return html;
        },

        // --- Gemini API Functions --- //
        async callGemini(prompt) {
            this.isLoading = true;
            const apiKey = ""; // Leave empty, handled by environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`API error: ${response.status} ${response.statusText} - ${errorBody}`);
                }

                const result = await response.json();
                
                if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                    this.isLoading = false;
                    return result.candidates[0].content.parts[0].text;
                } else {
                    console.error("Invalid response structure from API:", result);
                    throw new Error("Invalid response structure from API.");
                }
            } catch (error) {
                this.isLoading = false;
                this.showNotification(`AI Error: ${error.message}`, 'error');
                return null;
            }
        },

        async refineRequestDescription() {
            if (!this.form.recordsDescription.trim()) return;
            
            const lawInfo = this.selectedLaw ? `The request is being made in ${this.selectedLaw.name} under ${this.selectedLaw.lawName}.` : '';
            const prompt = `
                You are an expert in public records requests. Refine the following user-provided description to be more professional, clear, and legally effective. 
                Ensure the refined text is a direct replacement for the original, without any introductory or concluding phrases.
                Make it specific and reference common types of documents if applicable.
                ${lawInfo}

                Original description:
                "${this.form.recordsDescription}"

                Refined description:
            `;

            const refinedText = await this.callGemini(prompt);
            if (refinedText) {
                this.form.recordsDescription = refinedText.trim();
                this.showNotification('Request description refined by AI.', 'success');
            }
        },

        async getRecordSuggestions() {
            if (!this.selectedTemplate) return;
            
            const isCustom = this.selectedTemplate.startsWith('custom_');
            const templateId = isCustom ? this.selectedTemplate.replace('custom_', '') : this.selectedTemplate;
            const source = isCustom ? this.customTemplates : this.templates;
            const template = source.find(t => t.id === templateId);

            if (!template) return;

            const prompt = `
                A user is making a public records request using the "${template.name}" template. 
                Based on this topic, suggest a bulleted list of 3-5 additional, related records they might also want to request to get a more complete picture.
                Do not repeat items already in the original template description.
                Provide only the bulleted list, without any introductory or concluding text.

                Original template description:
                "${template.description || template.recordsDescription}"

                Bulleted list of suggestions:
            `;

            const suggestions = await this.callGemini(prompt);
            if (suggestions) {
                const suggestionsText = `\n\nAdditionally, please provide the following suggested records:\n${suggestions.trim()}`;
                this.form.recordsDescription += suggestionsText;
                this.showNotification('AI-powered suggestions added.', 'success');
            }
        },
        
        async generateFeeWaiverText() {
            if (!this.form.recordsDescription.trim()) {
                this.showNotification('Please describe the records you are requesting first.', 'error');
                return;
            }
            
            const prompt = `
                You are an expert in public records law. Write a concise, professional paragraph arguing for a fee waiver for a public records request.
                Base the argument on the fact that the requested information is in the public interest and will contribute to public understanding of government operations and activities.
                The request is not for commercial use.
                The subject of the request is: "${this.form.subject}".
                The specific records being requested are: "${this.form.recordsDescription}".
                
                Generate only the paragraph for the fee waiver request, with no introductory or concluding text.
            `;
            
            const waiverText = await this.callGemini(prompt);
            if (waiverText) {
                this.form.additionalNotes = waiverText.trim();
                this.showNotification('AI-generated fee waiver text added to Additional Notes.', 'success');
            }
        },


        // --- Event Handlers & Actions --- //
        onStateChange() { this.selectedLaw = this.form.state ? this.laws.find(l => l.code === this.form.state) : null; },
        applyTemplate() {
            if (!this.selectedTemplate) return;
            const isCustom = this.selectedTemplate.startsWith('custom_');
            const templateId = isCustom ? this.selectedTemplate.replace('custom_', '') : this.selectedTemplate;
            const source = isCustom ? this.customTemplates : this.templates;
            const template = source.find(t => t.id === templateId);

            if (template) {
                this.form.subject = template.subject;
                this.form.recordsDescription = template.recordsDescription || template.description;
                this.form.expeditedProcessing = template.expeditedProcessing || template.expedited || false;
                this.form.feeWaiverRequest = template.feeWaiverRequest || template.feeWaiver || false;
                this.form.additionalNotes = template.additionalNotes || '';
                if(template.preferredFormat) this.form.preferredFormat = template.preferredFormat;
                this.showNotification(`Applied template: ${this.t(template.id, template.name)}`, 'success');
            }
        },
        copyToClipboard() {
            const letterText = document.getElementById('letterPreviewContainer').innerText;
            navigator.clipboard.writeText(letterText).then(() => this.showNotification('Letter copied!', 'success'), () => this.showNotification('Copy failed.', 'error'));
        },
        exportAsText() {
            const letterText = document.getElementById('letterPreviewContainer').innerText;
            const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `public-records-request-${this.getCurrentDateForFilename()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        },
        exportAsPDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'letter'
            });
            
            doc.setFont('Times-Roman');
            
            const content = document.getElementById('letterPreview');
            
            doc.html(content, {
                callback: (doc) => {
                    doc.save(`public-records-request-${this.getCurrentDateForFilename()}.pdf`);
                },
                x: 15,
                y: 15,
                width: 585, // A4 width in points, with some margin
                windowWidth: content.scrollWidth
            });
             this.showNotification('PDF generation started...', 'info');
        },
        confirmStartOver() {
            this.showConfirmation('Start Over?', 'Are you sure you want to clear all form data?', () => {
                this.resetForm();
                this.showNotification('Form has been cleared.', 'success');
            });
        },

        // --- Utility Functions --- //
        getDateRangeText() {
            const { dateFrom, dateTo } = this.form;
            if (dateFrom && dateTo) return `${this.formatDate(dateFrom)} to ${this.formatDate(dateTo)}`;
            if (dateFrom) return `From ${this.formatDate(dateFrom)}`;
            if (dateTo) return `Through ${this.formatDate(dateTo)}`;
            return '';
        },
        getStateCitation() { 
            return this.selectedLaw?.fullCitation || 'the applicable state public records law'; 
        },
        getLegalRequirements() {
            if (!this.selectedLaw) return 'Please respond to this request within the timeframe required by law. If any portion of this request is denied, please cite the specific legal authority for the denial.';
            let text = `Under ${this.selectedLaw.fullCitation}, you are required to respond within ${this.selectedLaw.responseTime}. `;
            if (this.selectedLaw.denialProcess) {
                text += `${this.selectedLaw.denialProcess}`;
            }
            return text;
        },
        showConfirmation(title, body, onConfirmAction, confirmType = 'danger') {
            this.confirmModal = {
                open: true, title, body, onConfirm: onConfirmAction,
                confirmText: confirmType === 'danger' ? 'Confirm' : 'OK',
                confirmClass: confirmType === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700',
            };
        },
        showNotification(message, type = 'success') {
            const id = this.notificationCounter++;
            this.notifications.push({ id, message, type, visible: true });
            setTimeout(() => {
                const notification = this.notifications.find(n => n.id === id);
                if (notification) notification.visible = false;
                setTimeout(() => this.notifications = this.notifications.filter(n => n.id !== id), 500);
            }, 5000);
        },
        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString(this.currentLang, { year: 'numeric', month: 'long', day: 'numeric' });
        },
        getCurrentDate() { return new Date().toLocaleDateString(this.currentLang, { year: 'numeric', month: 'long', day: 'numeric' }); },
        getCurrentDateForFilename() { return new Date().toISOString().split('T')[0]; },
        
        // --- Custom Template Functions --- //
        openTemplateWizard() { this.resetCustomTemplate(); this.showTemplateWizard = true; },
        closeTemplateWizard() { this.showTemplateWizard = false; },
        resetCustomTemplate() {
            this.customTemplate = {
                id: '', name: '', subject: '', recordsDescription: '',
                additionalNotes: '', expeditedProcessing: false, feeWaiverRequest: false
            };
        },
        saveCustomTemplate() {
            if (!this.customTemplate.name.trim() || !this.customTemplate.subject.trim() || !this.customTemplate.recordsDescription.trim()) {
                this.showNotification('Template Name, Subject, and Description are required.', 'error');
                return;
            }
            const isEditing = !!this.customTemplate.id;
            if (isEditing) {
                const index = this.customTemplates.findIndex(t => t.id === this.customTemplate.id);
                if (index > -1) this.customTemplates[index] = { ...this.customTemplate };
            } else {
                this.customTemplate.id = Date.now().toString();
                this.customTemplates.push({ ...this.customTemplate });
            }
            this.saveCustomTemplatesToStorage();
            this.showNotification(isEditing ? 'Template updated!' : 'Template saved!', 'success');
            this.closeTemplateWizard();
        },
        editCustomTemplate(id) {
            const template = this.customTemplates.find(t => t.id === id);
            if (template) {
                this.customTemplate = { ...template };
                this.showTemplateWizard = true;
            }
        },
        deleteCustomTemplate(id) {
            this.showConfirmation('Delete Template?', 'This cannot be undone.', () => {
                this.customTemplates = this.customTemplates.filter(t => t.id !== id);
                this.saveCustomTemplatesToStorage();
                if (this.selectedTemplate === `custom_${id}`) this.selectedTemplate = '';
                this.showNotification('Template deleted.', 'success');
            });
        },
        loadCustomTemplatesFromStorage() {
            const saved = localStorage.getItem('customTemplates');
            this.customTemplates = saved ? JSON.parse(saved) : [];
        },
        saveCustomTemplatesToStorage() {
            localStorage.setItem('customTemplates', JSON.stringify(this.customTemplates));
        },
    };
}
