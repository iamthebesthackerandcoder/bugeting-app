# My Electron App - Budgeting Tool

A modern, cross-platform budgeting application built with Electron.

## Features

### 💰 **Core Financial Management**
- **Income Tracking** - Track all your income sources with detailed categorization
- **Expense Management** - Monitor spending across multiple categories
- **Bills Management** - Separate tracking for recurring bills and utilities
- **Savings Goals** - Set and track your savings targets with progress indicators
- **Investment Tracking** - Monitor your investment portfolio and returns
- **Debt Management** - Track and manage various types of debt
- **Goal Setting** - Set and track financial goals with deadlines

### 📊 **Advanced Analytics & Visualization**
- **Interactive Charts** - Beautiful charts powered by Chart.js
  - Overview pie charts showing category distribution
  - Trend analysis with 6-month historical data
  - Category comparison bar charts
- **Real-time Summary** - Live financial overview with budget status
- **Budget Limits & Alerts** - Set spending limits with visual warnings
- **Progress Tracking** - Visual progress bars for budget categories

### 🔄 **Automation & Smart Features**
- **Recurring Items** - Set up weekly, monthly, or yearly recurring transactions
- **Auto-save** - Automatic data backup every 30 seconds
- **Smart Notifications** - Get notified when recurring items are due
- **Budget Alerts** - Automatic warnings when approaching or exceeding limits

### 🔍 **Search & Organization**
- **Advanced Search** - Search by name, description, or tags
- **Date Filtering** - Filter by this month, last month, this year, or custom ranges
- **Tagging System** - Organize items with custom tags
- **Bulk Actions** - Perform actions on multiple items at once

### 📤 **Export & Backup**
- **Multiple Export Formats** - CSV, JSON, and PDF reports
- **Custom Date Ranges** - Export data for specific time periods
- **Selective Export** - Choose which categories to include
- **Automatic Backups** - Local storage backup with restore capability

### ⚙️ **Customization & Settings**
- **Multi-Currency Support** - USD, EUR, GBP, JPY, CAD with proper symbols
- **Date Format Options** - Multiple date format preferences
- **Theme Support** - Light/dark theme options (expandable)
- **Auto-backup Settings** - Configurable automatic backup preferences

### 🎨 **User Experience**
- **Modern UI** - Clean, intuitive interface with responsive design
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Real-time Validation** - Form validation with helpful error messages
- **Loading States** - Visual feedback for all operations
- **Tooltips** - Helpful hints throughout the interface

### 🔒 **Security & Performance**
- **Secure Architecture** - Built with Electron security best practices
- **Context Isolation** - Secure communication between processes
- **Data Validation** - Comprehensive input validation and sanitization
- **Performance Optimized** - Efficient rendering and data management

## Screenshots

*Add screenshots of your application here*

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd my-electron-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

## Development

### Available Scripts

- `npm start` - Run the application
- `npm run dev` - Run in development mode with DevTools
- `npm run build` - Build the application for distribution
- `npm run build:win` - Build for Windows
- `npm run build:mac` - Build for macOS
- `npm run build:linux` - Build for Linux

### Project Structure

```
my-electron-app/
├── main.js          # Main Electron process
├── preload.js       # Preload script for secure IPC
├── index.html       # Application UI
├── renderer.js      # Renderer process logic
├── styles.css       # Application styles
├── package.json     # Project configuration
├── assets/          # Icons and images
└── README.md        # This file
```

### Security

This application follows Electron security best practices:

- Context isolation enabled
- Node integration disabled in renderer
- Secure preload script for IPC communication
- Content Security Policy implemented

## Usage

### Getting Started

1. **Launch the app** - Run `npm start` to open the application
2. **Add income** - Click "Add Item" to add your income sources
3. **Track expenses** - Switch to the Expenses category and add your spending
4. **Monitor savings** - Use the Savings category to track your savings goals
5. **Your data is automatically saved** - No need to manually save, everything is stored automatically

### Keyboard Shortcuts

#### File Operations
- `Ctrl+N` / `Cmd+N` - New budget
- `Ctrl+I` / `Cmd+I` - Import budget file
- `Ctrl+E` / `Cmd+E` - Export budget file

#### Navigation & Search
- `Ctrl+F` / `Cmd+F` - Focus search input
- `Escape` - Close modal dialogs or clear search

#### Quick Actions
- `Ctrl+E` / `Cmd+E` - Open export dialog
- `Ctrl+,` / `Cmd+,` - Open settings
- `Enter` - Submit forms
- `Tab` - Navigate between form fields

#### Categories
- `1-7` - Quick switch between categories (when not in input)
- `+` - Add new item to current category

### File Format

Budget data is saved in JSON format with the following structure:

```json
{
  "income": [
    {
      "id": "1234567890",
      "name": "Salary",
      "amount": 5000,
      "category": "income",
      "description": "Monthly salary",
      "date": "2024-01-01T00:00:00.000Z"
    }
  ],
  "expenses": [...],
  "savings": [...]
}
```

## Building for Distribution

### Windows

```bash
npm run build:win
```

This creates an installer in the `dist/` directory.

### macOS

```bash
npm run build:mac
```

This creates a DMG file in the `dist/` directory.

### Linux

```bash
npm run build:linux
```

This creates an AppImage in the `dist/` directory.

## Customization

### Adding New Categories

1. Update the `budgetData` object in `renderer.js`
2. Add the category to the sidebar in `index.html`
3. Update the form select options
4. Add appropriate styling in `styles.css`

### Changing the Theme

Modify the CSS variables and color schemes in `styles.css` to customize the appearance.

### Adding Features

- **Charts**: Integrate Chart.js or similar for visual data representation
- **Export**: Add CSV/PDF export functionality
- **Recurring Items**: Implement recurring income/expenses
- **Categories**: Add custom category management
- **Budgets**: Set spending limits and alerts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/iamthebesthackerandcoder/todo/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## Advanced Usage

### Setting Up Recurring Items
1. Click "Add Item" and fill in the details
2. Set the "Recurring" field to weekly, monthly, or yearly
3. The app will automatically remind you when the item is due
4. You can add, skip, or modify recurring items from the notification

### Budget Limits & Alerts
1. Click "Set Budget Limit" in the sidebar
2. Choose a category and set a monthly limit
3. Set the alert percentage (default 80%)
4. Visual indicators will show when you're approaching or over budget

### Using Charts & Analytics
1. Click the "📊 Charts" button in the header
2. Switch between Overview, Trends, and Categories tabs
3. Overview shows current distribution
4. Trends shows 6-month income vs expenses
5. Categories shows detailed breakdown by category

### Export & Reporting
1. Click "📤 Export" in the header
2. Choose format: CSV (spreadsheet), JSON (data), or PDF (report)
3. Select date range and categories
4. Click "Export" to download the file

### Search & Filtering
1. Use the search box in the sidebar to find items
2. Search works on names, descriptions, and tags
3. Use date filters to view specific time periods
4. Combine search and filters for precise results

### Data Management
- **Automatic JSON Storage**: All data is automatically saved to JSON files in your user data directory
- **Auto-save**: Data is automatically saved every 30 seconds and when you make changes
- **No File Dialogs**: No need to choose where to save - the app handles storage automatically
- **Manual Backup**: Click "Backup Data" to create a timestamped backup file you can download
- **Import**: Use File > Import to load backup files from other locations
- **Export**: Use File > Export to save your data to a specific location
- **Local Storage Backup**: Data also persists in browser storage as a backup

## Troubleshooting

### Common Issues

**Charts not displaying**
- Ensure you have data in multiple categories
- Try refreshing the charts by switching tabs

**Recurring items not working**
- Check that the date is set correctly
- Ensure the recurring frequency is not set to "One-time"

**Export fails**
- Check that you have items in the selected date range
- Try a different export format

**Performance issues**
- Clear old data you no longer need
- Use date filters to view smaller data sets
- Consider exporting and starting fresh if you have thousands of items

### Data Recovery
If you lose data:
1. Data is automatically saved to JSON files in your user data directory and restored on startup
2. Check File > Import for recent backup files you may have downloaded
3. Look for auto-saved data in localStorage (automatically restored as backup)
4. Check the manual backup files you may have created

## Roadmap

### Completed ✅
- [x] Data visualization with charts
- [x] Multi-currency support
- [x] Advanced reporting features
- [x] Expense categorization
- [x] Recurring transactions
- [x] Budget limits and alerts
- [x] Search and filtering
- [x] Auto-save and backup

### Planned 🚧
- [ ] Cloud sync capabilities
- [ ] Mobile companion app
- [ ] Receipt scanning (OCR)
- [ ] Budget templates
- [ ] Advanced analytics dashboard
- [ ] Team/family budget sharing
- [ ] Investment portfolio tracking
- [ ] Tax preparation assistance
- [ ] Financial goal planning wizard
- [ ] Integration with banks/financial institutions

---

Built with ❤️ using Electron
