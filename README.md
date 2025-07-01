# Public Records Request Generator

A privacy-focused, client-side web application that helps users create professional public records requests with state-specific legal citations and personalized template customization.

![img](https://i.imgur.com/mZP7UIc.jpeg)

## 🌟 Features

### Core Functionality
- **Professional Letter Generation**: Create properly formatted public records requests with legal citations
- **50-State Legal Database**: Comprehensive legal requirements, response times, and appeal processes for all states
- **PDF Export**: Generate professional PDF documents ready for submission
- **Real-time Preview**: See your letter as you type with instant formatting
- **Dark Mode**: Eye-friendly interface with light/dark theme toggle

### Advanced Features
- **Template Customization Wizard**: 3-step process to create personalized request templates
- **Template Management**: Save, edit, duplicate, and delete custom templates
- **State-Specific Guidance**: Dynamic legal information panel showing requirements based on selected state
- **Form Validation**: Built-in validation to ensure all required fields are completed
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

### Privacy & Security
- **Client-Side Only**: No data sent to servers - everything runs in your browser
- **Local Storage**: Custom templates saved securely in your browser
- **No Registration**: Use immediately without creating accounts or providing personal information

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
1. Visit the application URL
2. Select your state from the dropdown
3. Choose a template or create your own
4. Fill in the form details
5. Preview and export your request as PDF

### Option 2: Run Locally
1. Clone or download this repository
2. Open a terminal in the project directory
3. Start a local server:
   ```bash
   python3 -m http.server 5000
   ```
4. Open your browser and go to `http://localhost:5000`

## 📋 How to Use

### Basic Usage
1. **Select Your State**: Choose your state from the prominent dropdown at the top
2. **Review Legal Requirements**: Read the state-specific information panel for important details
3. **Choose a Template**: Select from 8+ built-in templates or create your own
4. **Fill the Form**: Complete all required fields (marked with *)
5. **Preview**: Review your letter in real-time as you type
6. **Export**: Download as PDF or copy as text

### Creating Custom Templates
1. Click **"Create Custom Template"** button
2. **Step 1 - Basic Info**: Enter template name, category, and description
3. **Step 2 - Content**: Define subject line and records description templates
4. **Step 3 - Preview & Save**: Review and save your custom template

#### Template Placeholders
Use these placeholders in your custom templates for dynamic content:
- `[DESCRIPTION]` - General description placeholder
- `[SPECIFIC_RECORDS]` - Specific records being requested
- `[DATE_RANGE]` - Time period for records
- `[DEPARTMENT]` - Agency or department name
- `[LOCATION]` - Geographic location or address

### Managing Custom Templates
- **Use Template**: Select from the dropdown and apply to current form
- **Edit Template**: Modify existing custom templates
- **Duplicate Template**: Create copies to build similar templates quickly
- **Delete Template**: Remove templates you no longer need

## 🏛️ Built-in Templates

1. **General Public Records Request** - Basic template for any type of record
2. **Police Reports and Incident Records** - Law enforcement documentation
3. **Government Meeting Minutes** - City council, board meetings, etc.
4. **Budget and Financial Records** - Financial documents and expenditures
5. **Personnel and Employment Records** - Staff records and HR documentation
6. **Property and Real Estate Records** - Zoning, permits, assessments
7. **Environmental and Health Records** - Environmental impact, health inspections
8. **Communication Records** - Emails, correspondence, communication logs

## 🗺️ State-Specific Features

### Legal Citation Database
Each state includes:
- **Complete Legal Citations**: Full law names and statute references
- **Response Timeframes**: How long agencies have to respond
- **Fee Information**: Cost structures and fee waiver options
- **Appeal Process**: Steps if your request is denied
- **Attorney General Contact**: Direct contact for appeals and complaints

### Supported Jurisdictions
All 50 US states plus:
- District of Columbia
- Federal FOIA guidance
- Local government variations noted where applicable

## 🛠️ Technical Details

### Architecture
- **Frontend**: HTML5, CSS3 (Tailwind), JavaScript (Alpine.js)
- **PDF Generation**: jsPDF library for client-side document creation
- **Data Storage**: LocalStorage for custom templates
- **Styling**: Tailwind CSS with custom overrides
- **Icons**: Font Awesome 6

### Browser Compatibility
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **JavaScript Required**: Application requires JavaScript to function

### File Structure
```
├── index.html              # Main application interface
├── css/
│   └── custom.css         # Custom styling and print styles
├── js/
│   ├── app.js            # Main Alpine.js application logic
│   └── pdf-generator.js   # PDF generation functionality
├── data/
│   ├── laws.json         # State-specific legal citations
│   ├── states.json       # Basic state information
│   └── templates.json    # Pre-built request templates
└── README.md             # This documentation
```

## 🔧 Development

### Local Development
1. Make sure you have Python 3 installed
2. Clone the repository
3. Run the development server:
   ```bash
   python3 -m http.server 5000
   ```
4. Open `http://localhost:5000` in your browser
5. Make changes to files and refresh browser to see updates

### Adding New Templates
1. Edit `data/templates.json`
2. Add your template object with the required fields:
   ```json
   {
     "id": "unique_template_id",
     "name": "Template Display Name",
     "category": "Category Name",
     "subject": "Subject Line Template",
     "recordsDescription": "Description of records template",
     "agencyType": "Type of agency this applies to"
   }
   ```

### Updating Legal Information
1. Edit `data/laws.json`
2. Update the state entry with current legal citations and requirements
3. Follow the established JSON structure for consistency

## 📜 Legal Disclaimer

This application provides templates and guidance for public records requests but does not constitute legal advice. Users should:

- Verify current state laws and regulations
- Consult with legal professionals for complex requests
- Follow agency-specific procedures when available
- Understand that laws and procedures can change

The developers are not responsible for the accuracy of legal citations or the success of records requests made using this tool.

## 🤝 Contributing

We welcome contributions to improve the application:

1. **Bug Reports**: Report issues through the project repository
2. **Legal Updates**: Help keep state legal information current
3. **Template Suggestions**: Propose new built-in templates
4. **Feature Requests**: Suggest improvements or new functionality

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for details.

## 🆘 Support

### Common Issues
- **PDF Won't Generate**: Ensure all required fields are filled
- **Template Not Saving**: Check that JavaScript is enabled and browser supports LocalStorage
- **Missing State Info**: Verify that data files are loading correctly

### Getting Help
1. Check the built-in help text in the application
2. Review this README for detailed instructions
3. Ensure you have a modern browser with JavaScript enabled
4. Try refreshing the page if something seems broken

## 🔄 Recent Updates

### Version 2.0 (July 2025)
- ✅ Added personalized template customization wizard
- ✅ Enhanced state-specific legal guidance system
- ✅ Improved template management interface
- ✅ Added comprehensive 50-state legal database
- ✅ Mobile responsiveness improvements

### Version 1.0 (June 2025)
- ✅ Initial release with core functionality
- ✅ Basic template system and PDF generation
- ✅ State selection and legal citations
- ✅ Dark mode and responsive design

---

**Made with ❤️ for transparency and government accountability**

*This tool helps citizens exercise their right to access public information. Use it responsibly and help promote open government.*
