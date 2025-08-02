import React, { useState } from 'react';
import Papa from 'papaparse';
import './App.css';

const CSVProcessor = () => {
  const [primaryCsv, setPrimaryCsv] = useState({ data: [], headers: [], fileName: '' });
  const [referenceCsv, setReferenceCsv] = useState({ data: [], headers: [], fileName: '' });
  const [fieldMappings, setFieldMappings] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);

  // CSV dosyasını okuma
  const handleFileUpload = (event, csvType) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        complete: (result) => {
          const originalHeaders = result.data[0];
          const csvData = result.data.slice(1);
          
          if (csvType === 'primary') {
            setPrimaryCsv({
              data: csvData,
              headers: originalHeaders,
              fileName: file.name
            });
            
            if (referenceCsv.headers.length > 0) {
              generateAutoMapping(originalHeaders, referenceCsv.headers);
            }
          } else {
            setReferenceCsv({
              data: csvData,
              headers: originalHeaders,
              fileName: file.name
            });
            
            if (primaryCsv.headers.length > 0) {
              generateAutoMapping(primaryCsv.headers, originalHeaders);
            }
          }
        },
        header: false,
        skipEmptyLines: true
      });
    }
  };

  // Otomatik eşleme
  const generateAutoMapping = (primaryHeaders, referenceHeaders) => {
    const autoMapping = {};
    primaryHeaders.forEach((primaryHeader, index) => {
      const similarField = referenceHeaders.find(refHeader => 
        refHeader.toLowerCase().includes(primaryHeader.toLowerCase()) ||
        primaryHeader.toLowerCase().includes(refHeader.toLowerCase()) ||
        refHeader.toLowerCase() === primaryHeader.toLowerCase()
      );
      if (similarField) {
        autoMapping[index] = similarField;
      }
    });
    setFieldMappings(autoMapping);
  };

  // Field eşleme güncelleme
  const updateFieldMapping = (columnIndex, newFieldName) => {
    setFieldMappings({
      ...fieldMappings,
      [columnIndex]: newFieldName
    });
  };

  // Eşleme uygulama
  const applyFieldMapping = () => {
    const newHeaders = primaryCsv.headers.map((originalHeader, index) => {
      return fieldMappings[index] || originalHeader;
    });
    
    setPrimaryCsv({
      ...primaryCsv,
      headers: newHeaders
    });
  };

  // Veri güncelleme
  const updateCell = (rowIndex, colIndex, newValue) => {
    const updatedData = [...primaryCsv.data];
    updatedData[rowIndex][colIndex] = newValue;
    setPrimaryCsv({
      ...primaryCsv,
      data: updatedData
    });
  };

  // CSV verisini JSON obje formatına çevirme
  const convertToJSON = () => {
    return primaryCsv.data.map(row => {
      const obj = {};
      primaryCsv.headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  };

  // API'ye tüm veriyi POST ile gönderme
  const sendToAPI = async () => {
    if (!primaryCsv.data.length) {
      setApiError("No data found to send!");
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const jsonData = convertToJSON();
      console.log('Data sent to backend:', jsonData);

      const response = await fetch('http://localhost:8080/api/process-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Response from backend:', responseData);
      
      setApiResponse({
        status: response.status,
        data: responseData,
        timestamp: new Date().toISOString(),
        sentRecords: jsonData.length
      });

    } catch (error) {
      console.error('API Error:', error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Eşlemeleri temizle
  const clearMappings = () => {
    setFieldMappings({});
  };

  // JSON önizleme
  const previewJSON = () => {
    const jsonData = convertToJSON();
    return jsonData.slice(0, 3);
  };

  return (
    <div className="csv-processor">
      <h1 className="main-title">
        CSV to JSON API Processor
      </h1>
      
      {/* File Upload */}
      <div className="file-upload-grid">
        <div className="file-upload-section">
          <h3 className="section-title">
            <span className="section-icon">📊</span>
            Primary CSV (To Process)
          </h3>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, 'primary')}
            className="file-upload-input"
          />
          {primaryCsv.fileName && (
            <div className="file-info">
              <span>📄</span>
              {primaryCsv.fileName} ({primaryCsv.data.length} records)
            </div>
          )}
        </div>
        
        <div className="file-upload-section">
          <h3 className="section-title">
            <span className="section-icon">🔍</span>
            Reference CSV (Field Source)
          </h3>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, 'reference')}
            className="file-upload-input"
          />
          {referenceCsv.fileName && (
            <div className="file-info">
              <span>📄</span>
              {referenceCsv.fileName}
            </div>
          )}
        </div>
      </div>

      {/* Field Mapping */}
      {primaryCsv.headers.length > 0 && referenceCsv.headers.length > 0 && (
        <div className="field-mapping-container">
          <h3 className="field-mapping-title">
            <span>🔄</span>
            Field Mapping
          </h3>
          
          <div className="field-mapping-grid">
            {primaryCsv.headers.map((originalHeader, index) => (
              <div key={index} className="field-mapping-item">
                <span className="field-original-header">
                  {originalHeader}
                </span>
                <span className="mapping-arrow">→</span>
                <select
                  value={fieldMappings[index] || ''}
                  onChange={(e) => updateFieldMapping(index, e.target.value)}
                  className="field-mapping-select"
                >
                  <option value="">No Change</option>
                  {referenceCsv.headers.map((field, fieldIndex) => (
                    <option key={fieldIndex} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
                {fieldMappings[index] && <span className="field-mapping-success">✅</span>}
              </div>
            ))}
          </div>
          
          <div className="button-group">
            <button 
              onClick={applyFieldMapping}
              className="btn-apply-mapping"
            >
              ✅ Apply Mapping
            </button>
            <button 
              onClick={clearMappings}
              className="btn-clear-mapping"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}

      {/* JSON Preview */}
      {primaryCsv.data.length > 0 && (
        <div className="json-preview-container">
          <h3 className="json-preview-title">
            <span>👀</span>
            JSON Preview (First 3 Records)
          </h3>
          <pre className="json-preview-code">
            {JSON.stringify(previewJSON(), null, 2)}
          </pre>
          <div className="json-preview-info">
            Total {primaryCsv.data.length} records will be sent to Backend
          </div>
        </div>
      )}

      {/* Send to API Button */}
      <div className="api-button-container">
        <button 
          onClick={sendToAPI}
          disabled={!primaryCsv.data.length || isLoading}
          className="btn-send-api"
        >
          {isLoading && <span className="loading-spinner"></span>}
          {isLoading ? 'Sending to Backend...' : 'Send All Data to Backend'}
        </button>
      </div>

      {/* API Success Response */}
      {apiResponse && (
        <div className="api-success-response">
          <h3 className="api-success-title">
            <span>✅</span>
            Backend Response Successful!
          </h3>
          
          <div className="api-success-info">
            <strong>Status:</strong> {apiResponse.status} | 
            <strong> Sent Records:</strong> {apiResponse.sentRecords} | 
            <strong> Time:</strong> {new Date(apiResponse.timestamp).toLocaleString('en-US')}
          </div>

          <details>
            <summary className="api-success-details">
              📋 View Backend Response
            </summary>
            <pre className="api-success-code">
              {JSON.stringify(apiResponse.data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="api-error-container">
          <h3 className="api-error-title">
            <span>❌</span>
            Backend Connection Error
          </h3>
          <p className="api-error-message">{apiError}</p>
          <div className="api-error-info">
            Make sure the backend server is running: <code>go run main.go</code>
          </div>
        </div>
      )}

      {/* Data Table */}
      {primaryCsv.data.length > 0 && (
        <div className="data-table-section">
          <h3 className="data-table-title">
            <span>📊</span>
            CSV Data Table (Editable)
          </h3>
          <div className="data-table-container">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {primaryCsv.headers.map((header, index) => (
                      <th 
                        key={index} 
                        className={fieldMappings[index] ? 'mapped' : 'unmapped'}
                      >
                        {header}
                        {fieldMappings[index] && (
                          <div className="mapping-indicator">
                            <span>✅</span>
                            Mapped
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {primaryCsv.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex}>
                          <input
                            type="text"
                            value={cell || ''}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="cell-input"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVProcessor;
