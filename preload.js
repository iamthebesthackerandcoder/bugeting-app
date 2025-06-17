const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Data storage operations
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  getSettingsPath: () => ipcRenderer.invoke('get-settings-path'),
  saveBudgetData: (data) => ipcRenderer.invoke('save-budget-data', data),
  loadBudgetData: () => ipcRenderer.invoke('load-budget-data'),
  saveAppSettings: (data) => ipcRenderer.invoke('save-app-settings', data),
  loadAppSettings: () => ipcRenderer.invoke('load-app-settings'),

  // Dialog operations
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // Menu events
  onMenuNew: (callback) => ipcRenderer.on('menu-new', callback),
  onMenuImport: (callback) => ipcRenderer.on('menu-import', callback),
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Auto-updater functions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),

  // Auto-updater events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),

  // Node.js APIs (if needed)
  platform: process.platform,

  // File system operations (secure wrapper)
  readFile: (filePath) => {
    const fs = require('fs');
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },

  writeFile: (filePath, data) => {
    const fs = require('fs');
    try {
      fs.writeFileSync(filePath, data, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  },

  // Path utilities
  joinPath: (...paths) => {
    const path = require('path');
    return path.join(...paths);
  },

  dirname: (filePath) => {
    const path = require('path');
    return path.dirname(filePath);
  },

  basename: (filePath) => {
    const path = require('path');
    return path.basename(filePath);
  }
});
