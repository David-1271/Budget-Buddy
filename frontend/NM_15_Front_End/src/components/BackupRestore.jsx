import React, { useState } from 'react';
import { dataAPI } from '../api/apiService';
import './BackupRestore.css';

const BackupRestore = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await dataAPI.createBackup();
      setMessage('Backup created successfully! Check your downloads folder.');
    } catch (err) {
      console.error('Error creating backup:', err);
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setRestoreFile(file);
    setError('');
    setMessage('');
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      setError('Please select a backup file to restore');
      return;
    }

    if (restoreFile.type !== 'application/json' && !restoreFile.name.endsWith('.json')) {
      setError('Please select a valid JSON backup file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      // Read the file content
      const fileContent = await readFileAsText(restoreFile);
      const backupData = JSON.parse(fileContent);

      // Validate backup data structure
      if (!backupData.transactions || !backupData.budgets) {
        setError('Invalid backup file format');
        return;
      }

      // Confirm with user before restoring (this will overwrite existing data)
      if (!window.confirm('This will replace all your current data with the backup data. Continue?')) {
        setLoading(false);
        return;
      }

      const result = await dataAPI.restoreData(backupData);
      setMessage(`Data restored successfully! Transactions: ${result.restored.transactions}, Budgets: ${result.restored.budgets}`);
    } catch (err) {
      console.error('Error restoring data:', err);
      setError(err.message || 'Failed to restore data. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return (
    <div className="backup-restore-container">
      <h1>Data Backup & Restore</h1>
      
      <div className="backup-section">
        <h2>Backup Your Data</h2>
        <p>Create a backup of your financial data to save it securely on your device.</p>
        <button 
          className="btn btn-primary"
          onClick={handleCreateBackup}
          disabled={loading}
        >
          {loading ? 'Creating Backup...' : 'Create Backup'}
        </button>
      </div>
      
      <div className="restore-section">
        <h2>Restore Your Data</h2>
        <p>Restore your financial data from a previously created backup file.</p>
        
        <div className="file-upload">
          <input
            type="file"
            id="restoreFile"
            accept=".json,application/json"
            onChange={handleFileChange}
            disabled={loading}
          />
          <label htmlFor="restoreFile" className="file-upload-label">
            Choose Backup File
          </label>
          {restoreFile && (
            <span className="file-name">
              Selected: {restoreFile.name}
            </span>
          )}
        </div>
        
        <button 
          className="btn btn-success"
          onClick={handleRestore}
          disabled={loading || !restoreFile}
        >
          {loading ? 'Restoring...' : 'Restore Data'}
        </button>
      </div>
      
      {message && (
        <div className="success-message">
          {message}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="info-section">
        <h3>About Data Backup & Restore</h3>
        <ul>
          <li>Backups include all your transactions and budgets</li>
          <li>Backup files are saved as secure JSON files on your device</li>
          <li>Restoring will replace all your current data with the backup data</li>
          <li>Always keep multiple backup copies in different locations</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupRestore;