// Application state
let budgetData = {
    income: [],
    expenses: [],
    savings: [],
    bills: [],
    investments: [],
    debt: [],
    goals: []
};

let currentCategory = 'income';
let currentCurrency = '$';
let budgetLimits = {};
let recurringItems = [];
let appSettings = {
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'MM/DD/YYYY',
    autoBackup: true,
    theme: 'light'
};

// DOM elements
const elements = {
    categoriesList: document.getElementById('categories-list'),
    currentCategoryTitle: document.getElementById('current-category'),
    itemsContainer: document.getElementById('items-container'),
    addItemBtn: document.getElementById('add-item-btn'),
    addItemModal: document.getElementById('add-item-modal'),
    addItemForm: document.getElementById('add-item-form'),
    closeModalBtn: document.getElementById('close-modal'),
    cancelBtn: document.getElementById('cancel-btn'),
    newBtn: document.getElementById('new-btn'),
    saveBtn: document.getElementById('save-btn'),
    statusMessage: document.getElementById('status-message'),
    appVersion: document.getElementById('app-version'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    totalBills: document.getElementById('total-bills'),
    netBalance: document.getElementById('net-balance'),
    budgetStatus: document.getElementById('budget-status'),
    categoryCount: document.getElementById('category-count'),
    categoryBudgetInfo: document.getElementById('category-budget-info'),

    // New feature elements
    searchBtn: document.getElementById('search-btn'),
    chartsBtn: document.getElementById('charts-btn'),
    exportBtn: document.getElementById('export-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    addRecurringBtn: document.getElementById('add-recurring-btn'),
    setBudgetBtn: document.getElementById('set-budget-btn'),
    backupBtn: document.getElementById('backup-btn'),
    bulkActionsBtn: document.getElementById('bulk-actions-btn'),
    dateFilter: document.getElementById('date-filter'),
    searchInput: document.getElementById('search-input'),

    // Modal elements
    chartsModal: document.getElementById('charts-modal'),
    settingsModal: document.getElementById('settings-modal'),
    budgetModal: document.getElementById('budget-modal'),
    exportModal: document.getElementById('export-modal'),

    // Form elements
    itemDate: document.getElementById('item-date'),
    itemRecurring: document.getElementById('item-recurring'),
    itemTags: document.getElementById('item-tags')
};

// Initialize the application
async function init() {
    try {
        // Set app version
        const version = await window.electronAPI.getAppVersion();
        elements.appVersion.textContent = `v${version}`;
    } catch (error) {
        console.error('Failed to get app version:', error);
    }

    setupEventListeners();
    await loadAppData(); // Wait for data to load
    updateDisplay();
    setStatus('Ready');

    // Setup auto-save
    setupAutoSave();

    // Check for recurring items due
    checkRecurringItems();

    // Setup periodic checks
    setInterval(checkRecurringItems, 60000); // Check every minute
}

// Setup event listeners
function setupEventListeners() {
    // Category selection
    elements.categoriesList.addEventListener('click', (e) => {
        const categoryItem = e.target.closest('.category-item');
        if (categoryItem) {
            const category = categoryItem.dataset.category;
            selectCategory(category);
        }
    });

    // Add item button
    elements.addItemBtn.addEventListener('click', () => {
        showAddItemModal();
    });

    // Modal controls
    elements.closeModalBtn.addEventListener('click', hideAddItemModal);
    elements.cancelBtn.addEventListener('click', hideAddItemModal);
    elements.addItemModal.addEventListener('click', (e) => {
        if (e.target === elements.addItemModal) {
            hideAddItemModal();
        }
    });

    // Form submission
    elements.addItemForm.addEventListener('submit', handleAddItem);

    // Top menu buttons
    elements.newBtn.addEventListener('click', newBudget);
    elements.saveBtn.addEventListener('click', () => saveBudgetManually());

    // New feature buttons
    elements.searchBtn.addEventListener('click', toggleSearch);
    elements.chartsBtn.addEventListener('click', showChartsModal);
    elements.exportBtn.addEventListener('click', showExportModal);
    elements.settingsBtn.addEventListener('click', showSettingsModal);
    elements.addRecurringBtn.addEventListener('click', showRecurringItemModal);
    elements.setBudgetBtn.addEventListener('click', showBudgetModal);
    elements.backupBtn.addEventListener('click', async () => {
        await createBackup();
    });
    elements.bulkActionsBtn.addEventListener('click', showBulkActions);

    // Filter and search
    elements.dateFilter.addEventListener('change', applyFilters);
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Modal close buttons
    setupModalCloseHandlers();

    // Menu events from main process
    window.electronAPI.onMenuNew(() => newBudget());
    window.electronAPI.onMenuImport((event, filePath) => importBudgetFromFile(filePath));
    window.electronAPI.onMenuExport((event, filePath) => exportBudgetToFile(filePath));

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Set default date for new items
    if (elements.itemDate) {
        elements.itemDate.valueAsDate = new Date();
    }
}

// Category management
function selectCategory(category) {
    currentCategory = category;

    // Update active category in sidebar
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');

    // Update content header
    elements.currentCategoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    // Update items display
    updateItemsDisplay();
}

// Modal management
function showAddItemModal() {
    elements.addItemModal.classList.add('show');
    document.getElementById('item-category').value = currentCategory;
    document.getElementById('item-name').focus();
}

function hideAddItemModal() {
    elements.addItemModal.classList.remove('show');
    elements.addItemForm.reset();

    // Reset edit mode
    const form = elements.addItemForm;
    delete form.dataset.editMode;
    delete form.dataset.editId;
    delete form.dataset.editCategory;

    // Reset modal title and button text
    document.querySelector('#add-item-modal h3').textContent = 'Add New Item';
    document.querySelector('#add-item-form button[type="submit"]').textContent = 'Add Item';

    // Reset date to today
    if (elements.itemDate) {
        elements.itemDate.valueAsDate = new Date();
    }
}

// Item management
function handleAddItem(e) {
    e.preventDefault();

    const form = elements.addItemForm;
    const isEditMode = form.dataset.editMode === 'true';
    const formData = new FormData(form);

    const item = {
        id: isEditMode ? form.dataset.editId : Date.now().toString(),
        name: formData.get('name'),
        amount: parseFloat(formData.get('amount')),
        category: formData.get('category'),
        description: formData.get('description') || '',
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        recurring: formData.get('recurring') || 'none',
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        createdAt: isEditMode ? undefined : new Date().toISOString()
    };

    if (isEditMode) {
        // Update existing item
        const oldCategory = form.dataset.editCategory;
        const itemIndex = budgetData[oldCategory].findIndex(i => i.id === item.id);

        if (itemIndex !== -1) {
            // Remove from old category if category changed
            if (oldCategory !== item.category) {
                budgetData[oldCategory].splice(itemIndex, 1);
                budgetData[item.category].push(item);
            } else {
                // Update in same category
                budgetData[oldCategory][itemIndex] = { ...budgetData[oldCategory][itemIndex], ...item };
            }
        }

        setStatus(`Updated ${item.name}`);
    } else {
        // Add new item
        budgetData[item.category].push(item);
        setStatus(`Added ${item.name} to ${item.category}`);
    }

    // Handle recurring items
    if (item.recurring !== 'none') {
        addToRecurringItems(item);
    }

    updateDisplay();
    hideAddItemModal();
    markDataChanged();

    // Auto-save after adding/updating item
    if (appSettings.autoBackup) {
        saveDataToFile();
    }

    // Check budget limits
    checkBudgetLimits(item.category);
}

function removeItem(category, itemId) {
    budgetData[category] = budgetData[category].filter(item => item.id !== itemId);
    updateDisplay();
    markDataChanged();

    // Auto-save after removing item
    if (appSettings.autoBackup) {
        saveDataToFile();
    }

    setStatus('Item removed');
}

// Display updates
function updateDisplay() {
    updateItemsDisplay();
    updateSummary();
    updateCategoryAmounts();
}

function updateItemsDisplay(searchTerm = '', dateFilter = 'all') {
    let items = budgetData[currentCategory];

    // Apply search filter
    if (searchTerm) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
        const now = new Date();
        items = items.filter(item => {
            const itemDate = new Date(item.date);
            switch (dateFilter) {
                case 'this-month':
                    return itemDate.getMonth() === now.getMonth() &&
                        itemDate.getFullYear() === now.getFullYear();
                case 'last-month':
                    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    return itemDate.getMonth() === lastMonth.getMonth() &&
                        itemDate.getFullYear() === lastMonth.getFullYear();
                case 'this-year':
                    return itemDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }

    // Update category count
    elements.categoryCount.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
        elements.itemsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No items found</h3>
                <p>${searchTerm || dateFilter !== 'all' ? 'Try adjusting your filters' : `Click "Add Item" to get started with your ${currentCategory}`}</p>
            </div>
        `;
        return;
    }

    const itemsHtml = items.map(item => {
        const isExpenseType = ['expenses', 'bills', 'debt'].includes(item.category);
        const tagsHtml = item.tags && item.tags.length > 0
            ? `<div class="item-tags">${item.tags.map(tag => `<span class="item-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
            : '';

        return `
            <div class="item ${isExpenseType ? 'expense' : ''} ${item.recurring !== 'none' ? 'recurring' : ''}">
                <div class="item-info">
                    <div class="item-name">${escapeHtml(item.name)}</div>
                    ${item.description ? `<div class="item-description">${escapeHtml(item.description)}</div>` : ''}
                    ${tagsHtml}
                    <div class="item-meta">
                        <span class="item-date">${formatDate(item.date)}</span>
                        ${item.recurring !== 'none' ? `<span class="item-recurring">Recurring: ${item.recurring}</span>` : ''}
                    </div>
                </div>
                <div class="item-amount">${currentCurrency}${item.amount.toFixed(2)}</div>
                <div class="item-actions">
                    <button class="btn btn-small btn-secondary" onclick="editItem('${item.category}', '${item.id}')">Edit</button>
                    <button class="btn btn-small btn-secondary" onclick="removeItem('${item.category}', '${item.id}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');

    elements.itemsContainer.innerHTML = `<div class="item-list">${itemsHtml}</div>`;
}

function updateSummary() {
    const totalIncome = budgetData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = budgetData.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalBills = budgetData.bills.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = budgetData.savings.reduce((sum, item) => sum + item.amount, 0);
    const totalInvestments = budgetData.investments.reduce((sum, item) => sum + item.amount, 0);
    const totalDebt = budgetData.debt.reduce((sum, item) => sum + item.amount, 0);

    const totalOutgoing = totalExpenses + totalBills + totalSavings + totalInvestments + totalDebt;
    const netBalance = totalIncome - totalOutgoing;

    elements.totalIncome.textContent = `${currentCurrency}${totalIncome.toFixed(2)}`;
    elements.totalExpenses.textContent = `${currentCurrency}${totalExpenses.toFixed(2)}`;
    elements.totalBills.textContent = `${currentCurrency}${totalBills.toFixed(2)}`;
    elements.netBalance.textContent = `${currentCurrency}${netBalance.toFixed(2)}`;

    // Update net balance color
    elements.netBalance.className = 'summary-value';
    if (netBalance > 0) {
        elements.netBalance.classList.add('positive');
    } else if (netBalance < 0) {
        elements.netBalance.classList.add('negative');
    }

    // Update budget status
    updateBudgetStatus();
}

function updateCategoryAmounts() {
    const categories = Object.keys(budgetData);

    categories.forEach(category => {
        const amount = budgetData[category].reduce((sum, item) => sum + item.amount, 0);
        const element = document.querySelector(`[data-category="${category}"] .category-amount`);
        if (element) {
            element.textContent = `${currentCurrency}${amount.toFixed(2)}`;
        }

        // Update budget info if limit exists
        const budgetElement = document.querySelector(`[data-category="${category}"] .category-budget`);
        if (budgetElement && budgetLimits[category]) {
            const limit = budgetLimits[category].limit;
            const percentage = (amount / limit) * 100;
            budgetElement.textContent = `${percentage.toFixed(0)}% of ${currentCurrency}${limit.toFixed(2)}`;
        }
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function updateBudgetStatus() {
    let status = 'On Track';
    let hasOverBudget = false;
    let hasNearBudget = false;

    Object.keys(budgetLimits).forEach(category => {
        const currentAmount = budgetData[category].reduce((sum, item) => {
            const itemDate = new Date(item.date);
            const now = new Date();
            const isCurrentMonth = itemDate.getMonth() === now.getMonth() &&
                itemDate.getFullYear() === now.getFullYear();
            return isCurrentMonth ? sum + item.amount : sum;
        }, 0);

        const limit = budgetLimits[category].limit;
        const alertThreshold = (budgetLimits[category].alert / 100) * limit;

        if (currentAmount >= limit) {
            hasOverBudget = true;
        } else if (currentAmount >= alertThreshold) {
            hasNearBudget = true;
        }
    });

    if (hasOverBudget) {
        status = 'Over Budget';
        elements.budgetStatus.className = 'summary-value negative';
    } else if (hasNearBudget) {
        status = 'Near Limit';
        elements.budgetStatus.className = 'summary-value';
        elements.budgetStatus.style.color = '#ff9800';
    } else {
        elements.budgetStatus.className = 'summary-value positive';
    }

    elements.budgetStatus.textContent = status;
}

function editItem(category, itemId) {
    const item = budgetData[category].find(item => item.id === itemId);
    if (!item) return;

    // Pre-fill the form with existing data
    showAddItemModal();
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-amount').value = item.amount;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-date').value = item.date;
    document.getElementById('item-recurring').value = item.recurring || 'none';
    document.getElementById('item-tags').value = item.tags ? item.tags.join(', ') : '';
    document.getElementById('item-description').value = item.description || '';

    // Change form behavior to edit mode
    const form = elements.addItemForm;
    form.dataset.editMode = 'true';
    form.dataset.editId = itemId;
    form.dataset.editCategory = category;

    document.querySelector('#add-item-modal h3').textContent = 'Edit Item';
    document.querySelector('#add-item-form button[type="submit"]').textContent = 'Update Item';
}

// File operations
async function newBudget() {
    const result = await window.electronAPI.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        message: 'Create new budget?',
        detail: 'This will clear all current data. Current data will be automatically saved.'
    });

    if (result.response === 0) {
        // Save current data before clearing
        await saveDataToFile();

        budgetData = {
            income: [],
            expenses: [],
            savings: [],
            bills: [],
            investments: [],
            debt: [],
            goals: []
        };
        budgetLimits = {};
        recurringItems = [];

        // Reset filters
        elements.searchInput.value = '';
        elements.dateFilter.value = 'all';

        // Save the new empty budget
        await saveDataToFile();
        updateDisplay();
        setStatus('New budget created and saved');
    }
}

async function saveDataToFile() {
    try {
        const data = {
            budgetData,
            budgetLimits,
            recurringItems,
            appSettings,
            lastSaved: new Date().toISOString()
        };

        const result = await window.electronAPI.saveBudgetData(JSON.stringify(data, null, 2));
        if (result.success) {
            setStatus('Budget saved automatically');
            hasUnsavedChanges = false;
            updateStatus();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Save failed:', error);
        setStatus('Save failed: ' + error.message);
    }
}

async function saveBudgetManually() {
    try {
        // Show saving indicator
        setStatus('Saving budget...');
        elements.saveBtn.disabled = true;
        elements.saveBtn.textContent = '💾 Saving...';

        const data = {
            budgetData,
            budgetLimits,
            recurringItems,
            appSettings,
            lastSaved: new Date().toISOString()
        };

        const result = await window.electronAPI.saveBudgetData(JSON.stringify(data, null, 2));

        if (result.success) {
            hasUnsavedChanges = false;
            updateStatus();

            // Show success message
            setStatus('✅ Budget saved successfully!');

            // Show confirmation dialog
            await window.electronAPI.showMessageBox({
                type: 'info',
                title: 'Save Successful',
                message: 'Budget Saved Successfully!',
                detail: `Your budget data has been saved automatically to your user data folder.\n\nLast saved: ${new Date().toLocaleString()}`
            });

        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Manual save failed:', error);
        setStatus('❌ Save failed: ' + error.message);

        // Show error dialog
        await window.electronAPI.showMessageBox({
            type: 'error',
            title: 'Save Failed',
            message: 'Failed to Save Budget',
            detail: `An error occurred while saving your budget:\n\n${error.message}`
        });
    } finally {
        // Reset button state
        elements.saveBtn.disabled = false;
        elements.saveBtn.textContent = '💾 Save Budget';
    }
}



async function importBudgetFromFile(filePath) {
    try {
        const data = window.electronAPI.readFile(filePath);
        const parsed = JSON.parse(data);

        // Validate data structure
        if (parsed.income && parsed.expenses && parsed.savings) {
            budgetData = parsed;
            updateDisplay();
            await saveDataToFile(); // Save imported data
            setStatus(`Budget imported from ${window.electronAPI.basename(filePath)}`);
        } else {
            throw new Error('Invalid budget file format');
        }
    } catch (error) {
        console.error('Import failed:', error);
        setStatus('Import failed: ' + error.message);
        await window.electronAPI.showMessageBox({
            type: 'error',
            message: 'Failed to import budget',
            detail: error.message
        });
    }
}

async function exportBudgetToFile(filePath) {
    try {
        const data = JSON.stringify(budgetData, null, 2);
        window.electronAPI.writeFile(filePath, data);
        setStatus(`Budget exported to ${window.electronAPI.basename(filePath)}`);
    } catch (error) {
        console.error('Export failed:', error);
        setStatus('Export failed: ' + error.message);
    }
}

// Utility functions
function setStatus(message) {
    elements.statusMessage.textContent = message;
    setTimeout(() => {
        elements.statusMessage.textContent = 'Ready';
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// New Feature Functions

// Search and Filter
function toggleSearch() {
    const searchContainer = elements.searchInput.parentElement;
    searchContainer.style.display = searchContainer.style.display === 'none' ? 'flex' : 'none';
    if (searchContainer.style.display !== 'none') {
        elements.searchInput.focus();
    }
}

function applyFilters() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const dateFilter = elements.dateFilter.value;

    // Apply filters to current category items
    updateItemsDisplay(searchTerm, dateFilter);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modal Management
function setupModalCloseHandlers() {
    // Charts modal
    document.getElementById('close-charts-modal')?.addEventListener('click', () => {
        elements.chartsModal.classList.remove('show');
    });

    // Settings modal
    document.getElementById('close-settings-modal')?.addEventListener('click', () => {
        elements.settingsModal.classList.remove('show');
    });

    // Budget modal
    document.getElementById('close-budget-modal')?.addEventListener('click', () => {
        elements.budgetModal.classList.remove('show');
    });

    // Export modal
    document.getElementById('close-export-modal')?.addEventListener('click', () => {
        elements.exportModal.classList.remove('show');
    });

    // Click outside to close
    [elements.chartsModal, elements.settingsModal, elements.budgetModal, elements.exportModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }
    });
}

function showChartsModal() {
    elements.chartsModal.classList.add('show');
    generateCharts();
}

function showSettingsModal() {
    elements.settingsModal.classList.add('show');
    loadSettings();
}

function showBudgetModal() {
    elements.budgetModal.classList.add('show');
}

function showExportModal() {
    elements.exportModal.classList.add('show');
    setupExportDates();
}

function showRecurringItemModal() {
    // Reuse the add item modal but pre-fill recurring
    showAddItemModal();
    elements.itemRecurring.value = 'monthly';
}

// Budget Management
function checkBudgetLimits(category) {
    if (!budgetLimits[category]) return;

    const currentAmount = budgetData[category].reduce((sum, item) => {
        const itemDate = new Date(item.date);
        const now = new Date();
        const isCurrentMonth = itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear();
        return isCurrentMonth ? sum + item.amount : sum;
    }, 0);

    const limit = budgetLimits[category].limit;
    const alertThreshold = (budgetLimits[category].alert / 100) * limit;

    if (currentAmount >= limit) {
        showBudgetAlert(category, 'over', currentAmount, limit);
    } else if (currentAmount >= alertThreshold) {
        showBudgetAlert(category, 'near', currentAmount, limit);
    }

    updateBudgetProgress(category, currentAmount, limit);
}

function showBudgetAlert(category, type, current, limit) {
    const message = type === 'over'
        ? `⚠️ Budget exceeded for ${category}! Current: $${current.toFixed(2)}, Limit: $${limit.toFixed(2)}`
        : `⚠️ Approaching budget limit for ${category}. Current: $${current.toFixed(2)}, Limit: $${limit.toFixed(2)}`;

    setStatus(message);

    // Add visual indicator to category
    const categoryElement = document.querySelector(`[data-category="${category}"]`);
    if (categoryElement) {
        categoryElement.classList.remove('near-budget', 'over-budget');
        categoryElement.classList.add(type === 'over' ? 'over-budget' : 'near-budget');
    }
}

function updateBudgetProgress(category, current, limit) {
    const categoryElement = document.querySelector(`[data-category="${category}"]`);
    if (!categoryElement) return;

    let progressBar = categoryElement.querySelector('.budget-progress-bar');
    if (!progressBar) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'budget-progress';
        progressBar = document.createElement('div');
        progressBar.className = 'budget-progress-bar';
        progressContainer.appendChild(progressBar);
        categoryElement.appendChild(progressContainer);
    }

    const percentage = Math.min((current / limit) * 100, 100);
    progressBar.style.width = `${percentage}%`;

    progressBar.className = 'budget-progress-bar';
    if (percentage >= 100) {
        progressBar.classList.add('danger');
    } else if (percentage >= 80) {
        progressBar.classList.add('warning');
    }
}

// Recurring Items
function addToRecurringItems(item) {
    const recurringItem = {
        ...item,
        originalId: item.id,
        nextDue: calculateNextDue(item.date, item.recurring)
    };
    recurringItems.push(recurringItem);
}

function calculateNextDue(startDate, frequency) {
    const date = new Date(startDate);
    switch (frequency) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date.toISOString().split('T')[0];
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    if (e.key === 'Escape') {
        // Close any open modal
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
        hideAddItemModal();
    }

    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                saveBudgetManually();
                break;
            case 'f':
                e.preventDefault();
                elements.searchInput.focus();
                break;
            case 'e':
                e.preventDefault();
                showExportModal();
                break;
            case ',':
                e.preventDefault();
                showSettingsModal();
                break;
        }
    }
}

// Charts and Visualization
let currentChart = null;

function generateCharts() {
    const canvas = document.getElementById('main-chart');
    if (!canvas) return;

    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }

    const activeTab = document.querySelector('.chart-tab.active')?.dataset.chart || 'overview';

    switch (activeTab) {
        case 'overview':
            generateOverviewChart(canvas);
            break;
        case 'trends':
            generateTrendsChart(canvas);
            break;
        case 'categories':
            generateCategoriesChart(canvas);
            break;
    }
}

function generateOverviewChart(canvas) {
    const ctx = canvas.getContext('2d');

    const categories = Object.keys(budgetData);
    const totals = categories.map(cat =>
        budgetData[cat].reduce((sum, item) => sum + item.amount, 0)
    ).filter(total => total > 0);

    const labels = categories.filter((cat, index) =>
        budgetData[cat].reduce((sum, item) => sum + item.amount, 0) > 0
    );

    if (totals.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
        return;
    }

    const colors = [
        '#4CAF50', '#f44336', '#2196F3', '#ff9800',
        '#9c27b0', '#607d8b', '#795548', '#e91e63'
    ];

    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
            datasets: [{
                data: totals,
                backgroundColor: colors.slice(0, totals.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${currentCurrency}${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function generateTrendsChart(canvas) {
    const ctx = canvas.getContext('2d');

    // Get last 6 months of data
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));

        const monthIncome = budgetData.income.filter(item =>
            item.date.startsWith(monthKey)
        ).reduce((sum, item) => sum + item.amount, 0);

        const monthExpenses = ['expenses', 'bills', 'debt'].reduce((total, category) => {
            return total + budgetData[category].filter(item =>
                item.date.startsWith(monthKey)
            ).reduce((sum, item) => sum + item.amount, 0);
        }, 0);

        incomeData.push(monthIncome);
        expenseData.push(monthExpenses);
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${currentCurrency}${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return currentCurrency + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function generateCategoriesChart(canvas) {
    const ctx = canvas.getContext('2d');

    const categories = Object.keys(budgetData);
    const data = categories.map(category => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        amount: budgetData[category].reduce((sum, item) => sum + item.amount, 0),
        count: budgetData[category].length
    })).filter(item => item.amount > 0);

    if (data.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', canvas.width / 2, canvas.height / 2);
        return;
    }

    const colors = [
        '#4CAF50', '#f44336', '#2196F3', '#ff9800',
        '#9c27b0', '#607d8b', '#795548', '#e91e63'
    ];

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: 'Amount',
                data: data.map(item => item.amount),
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 1,
                borderColor: colors.slice(0, data.length).map(color => color + '80')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataPoint = data[context.dataIndex];
                            return [
                                `Amount: ${currentCurrency}${context.parsed.y.toFixed(2)}`,
                                `Items: ${dataPoint.count}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return currentCurrency + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Export Functions
function setupExportDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    document.getElementById('export-start-date').valueAsDate = firstDay;
    document.getElementById('export-end-date').valueAsDate = today;
}

function exportData() {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    const startDate = document.getElementById('export-start-date').value;
    const endDate = document.getElementById('export-end-date').value;
    const selectedCategories = Array.from(document.querySelectorAll('input[name="export-categories"]:checked'))
        .map(cb => cb.value);

    const filteredData = {};
    selectedCategories.forEach(category => {
        filteredData[category] = budgetData[category].filter(item => {
            const itemDate = item.date;
            return itemDate >= startDate && itemDate <= endDate;
        });
    });

    switch (format) {
        case 'csv':
            exportToCSV(filteredData);
            break;
        case 'json':
            exportToJSON(filteredData);
            break;
        case 'pdf':
            exportToPDF(filteredData);
            break;
    }
}

function exportToCSV(data) {
    let csv = 'Category,Name,Amount,Date,Description,Tags\n';

    Object.keys(data).forEach(category => {
        data[category].forEach(item => {
            const tags = item.tags ? item.tags.join(';') : '';
            csv += `"${category}","${item.name}","${item.amount}","${item.date}","${item.description || ''}","${tags}"\n`;
        });
    });

    downloadFile(csv, 'budget-export.csv', 'text/csv');
}

function exportToJSON(data) {
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, 'budget-export.json', 'application/json');
}

function exportToPDF(data) {
    // Simple PDF export - in a real app, you'd use a library like jsPDF
    let content = 'BUDGET REPORT\n\n';

    Object.keys(data).forEach(category => {
        content += `${category.toUpperCase()}\n`;
        content += '='.repeat(category.length) + '\n';

        let total = 0;
        data[category].forEach(item => {
            content += `${item.name}: $${item.amount.toFixed(2)} (${item.date})\n`;
            total += item.amount;
        });

        content += `Total: $${total.toFixed(2)}\n\n`;
    });

    downloadFile(content, 'budget-report.txt', 'text/plain');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Settings Management
function loadSettings() {
    document.getElementById('currency-select').value = appSettings.currency;
    document.getElementById('date-format-select').value = appSettings.dateFormat;
    document.getElementById('auto-backup-checkbox').checked = appSettings.autoBackup;
}

async function saveSettings() {
    appSettings.currency = document.getElementById('currency-select').value;
    appSettings.dateFormat = document.getElementById('date-format-select').value;
    appSettings.autoBackup = document.getElementById('auto-backup-checkbox').checked;

    // Update currency symbol
    const currencyMap = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$'
    };

    appSettings.currencySymbol = currencyMap[appSettings.currency] || '$';
    currentCurrency = appSettings.currencySymbol;

    // Save settings to JSON file
    await saveDataToFile();

    updateDisplay();
    elements.settingsModal.classList.remove('show');
    setStatus('Settings saved');
}

// Backup Functions
async function createBackup() {
    // First ensure current data is saved
    await saveDataToFile();

    const backupData = {
        budgetData,
        budgetLimits,
        recurringItems,
        appSettings,
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(backupData, null, 2);
    const filename = `budget-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(json, filename, 'application/json');
    setStatus('Backup created successfully');
}

// Bulk Actions
function showBulkActions() {
    // Simple implementation - could be expanded
    const actions = ['Delete Selected', 'Export Selected', 'Move to Category'];
    const action = prompt(`Choose action:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`);

    if (action) {
        setStatus(`Bulk action "${actions[parseInt(action) - 1]}" would be performed here`);
    }
}

// Additional Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Export button handler
    document.getElementById('export-btn-confirm')?.addEventListener('click', () => {
        exportData();
        elements.exportModal.classList.remove('show');
    });

    // Settings save handler
    document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
        await saveSettings();
    });

    // Budget form handler
    document.getElementById('budget-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const category = formData.get('category');
        const limit = parseFloat(formData.get('limit'));
        const alert = parseInt(formData.get('alert'));

        budgetLimits[category] = { limit, alert };
        elements.budgetModal.classList.remove('show');
        updateDisplay();
        setStatus(`Budget limit set for ${category}: ${currentCurrency}${limit.toFixed(2)}`);
    });

    // Chart tab handlers
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            generateCharts();
        });
    });
});

// Advanced Features

// Auto-save functionality
let autoSaveTimer = null;
let hasUnsavedChanges = false;

function setupAutoSave() {
    // Save data to JSON file every 30 seconds if there are changes
    setInterval(async () => {
        if (hasUnsavedChanges && appSettings.autoBackup) {
            await saveDataToFile();
            // Also save to localStorage as backup
            saveToLocalStorage();
        }
    }, 30000);

    // Save on window close
    window.addEventListener('beforeunload', async (e) => {
        if (hasUnsavedChanges) {
            await saveDataToFile();
            saveToLocalStorage();
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function markDataChanged() {
    hasUnsavedChanges = true;
    updateStatus();
}

function saveToLocalStorage() {
    try {
        const data = {
            budgetData,
            budgetLimits,
            recurringItems,
            appSettings,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('budgetAppData', JSON.stringify(data));
        setStatus('Auto-saved');
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

async function loadAppData() {
    try {
        // Try to load from JSON file automatically on startup
        const result = await window.electronAPI.loadBudgetData();
        if (result.success && result.data) {
            const parsed = JSON.parse(result.data);

            // Validate and load data structure
            if (parsed.budgetData) {
                budgetData = {
                    income: [],
                    expenses: [],
                    savings: [],
                    bills: [],
                    investments: [],
                    debt: [],
                    goals: [],
                    ...parsed.budgetData
                };

                budgetLimits = parsed.budgetLimits || {};
                recurringItems = parsed.recurringItems || [];
                appSettings = { ...appSettings, ...parsed.appSettings };

                // Update currency
                currentCurrency = appSettings.currencySymbol;

                setStatus(`Budget loaded automatically (${new Date(parsed.lastSaved).toLocaleDateString()})`);
            } else {
                throw new Error('Invalid budget file format');
            }
        } else if (result.success && !result.data) {
            setStatus('No saved budget found - starting fresh');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Failed to load from JSON file, trying localStorage:', error);

        // Fallback to localStorage
        try {
            const saved = localStorage.getItem('budgetAppData');
            if (saved) {
                const data = JSON.parse(saved);

                // Merge with defaults to handle new categories
                budgetData = {
                    income: [],
                    expenses: [],
                    savings: [],
                    bills: [],
                    investments: [],
                    debt: [],
                    goals: [],
                    ...data.budgetData
                };

                budgetLimits = data.budgetLimits || {};
                recurringItems = data.recurringItems || [];
                appSettings = { ...appSettings, ...data.appSettings };

                // Update currency
                currentCurrency = appSettings.currencySymbol;

                setStatus(`Loaded data from localStorage backup (${new Date(data.lastSaved).toLocaleDateString()})`);

                // Save to JSON file for future use
                await saveDataToFile();
            } else {
                setStatus('No saved data found - starting fresh');
            }
        } catch (localStorageError) {
            console.error('Failed to load from localStorage:', localStorageError);
            setStatus('Failed to load saved data - starting fresh');
        }
    }
}

// Recurring Items Management
function checkRecurringItems() {
    const today = new Date().toISOString().split('T')[0];
    const dueItems = recurringItems.filter(item => item.nextDue <= today);

    if (dueItems.length > 0) {
        showRecurringNotification(dueItems);
    }
}

function showRecurringNotification(dueItems) {
    const message = `${dueItems.length} recurring item${dueItems.length > 1 ? 's' : ''} due today!`;
    showNotification(message, 'info', () => {
        // Show modal with due items
        showDueRecurringItems(dueItems);
    });
}

function showDueRecurringItems(dueItems) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Recurring Items Due</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    The following recurring items are due today:
                </div>
                ${dueItems.map(item => `
                    <div class="recurring-due-item">
                        <div class="item-info">
                            <strong>${item.name}</strong>
                            <div class="item-details">
                                ${item.category} • ${currentCurrency}${item.amount.toFixed(2)} • ${item.recurring}
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-small btn-primary" onclick="addRecurringItem('${item.id}')">Add Now</button>
                            <button class="btn btn-small btn-secondary" onclick="skipRecurringItem('${item.id}')">Skip</button>
                        </div>
                    </div>
                `).join('')}
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="addAllRecurringItems()">Add All</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Notification System
function showNotification(message, type = 'info', action = null) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            ${action ? '<button class="notification-action">View</button>' : ''}
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add to page
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Event listeners
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });

    if (action) {
        notification.querySelector('.notification-action').addEventListener('click', () => {
            action();
            notification.remove();
        });
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Data Validation
function validateItemData(item) {
    const errors = [];

    if (!item.name || item.name.trim().length === 0) {
        errors.push('Name is required');
    }

    if (!item.amount || item.amount <= 0) {
        errors.push('Amount must be greater than 0');
    }

    if (!item.category) {
        errors.push('Category is required');
    }

    if (!item.date) {
        errors.push('Date is required');
    }

    return errors;
}

// Enhanced Status Updates
function updateStatus() {
    const statusText = hasUnsavedChanges ? 'Unsaved changes' : 'Ready';
    elements.statusMessage.textContent = statusText;
    elements.statusMessage.className = hasUnsavedChanges ? 'status-unsaved' : '';
}

// Global functions for recurring items
window.addRecurringItem = function (itemId) {
    const recurringItem = recurringItems.find(item => item.id === itemId);
    if (recurringItem) {
        const newItem = {
            ...recurringItem,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        budgetData[newItem.category].push(newItem);

        // Update next due date
        recurringItem.nextDue = calculateNextDue(recurringItem.nextDue, recurringItem.recurring);

        updateDisplay();
        markDataChanged();
        setStatus(`Added recurring item: ${newItem.name}`);
    }
};

window.skipRecurringItem = function (itemId) {
    const recurringItem = recurringItems.find(item => item.id === itemId);
    if (recurringItem) {
        recurringItem.nextDue = calculateNextDue(recurringItem.nextDue, recurringItem.recurring);
        setStatus(`Skipped recurring item: ${recurringItem.name}`);
    }
};

window.addAllRecurringItems = function () {
    const today = new Date().toISOString().split('T')[0];
    const dueItems = recurringItems.filter(item => item.nextDue <= today);

    dueItems.forEach(recurringItem => {
        const newItem = {
            ...recurringItem,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        budgetData[newItem.category].push(newItem);
        recurringItem.nextDue = calculateNextDue(recurringItem.nextDue, recurringItem.recurring);
    });

    updateDisplay();
    markDataChanged();
    setStatus(`Added ${dueItems.length} recurring items`);
    document.querySelector('.modal').remove();
};

// Make functions available globally for onclick handlers
window.removeItem = removeItem;
window.editItem = editItem;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
