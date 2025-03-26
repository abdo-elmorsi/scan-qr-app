import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5Qrcode } from 'html5-qrcode';
import './style.css'; // Import the CSS file

const QRScannerWithUpload = () => {
  const [name, setName] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileScanning, setIsFileScanning] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);

  // Initialize QR code scanner
  const startScanner = () => {
    setIsScanning(true);
    setIsFileScanning(false);
    setCameraError(null);
    setSelectedFile(null);
    setScanResult(null);

    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        facingMode: 'environment'
      });

      scanner.render(
        (result) => {
          handleScanSuccess(result, scanner);
        },
        (error) => {
          handleScanError(error);
        }
      );

      scannerRef.current = scanner;
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setIsFileScanning(true);
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      scanQRFromFile(file);
    }
  };

  // Scan QR code from uploaded file
  const scanQRFromFile = async (file) => {
    setIsFileScanning(true);
    setCameraError(null);

    try {
      const html5QrCode = new Html5Qrcode("file-qr-reader");
      const result = await html5QrCode.scanFile(file, false);
      handleScanSuccess(result, null);
    } catch (error) {
      let errorMessage = "Failed to scan QR code from file";

      if (error.message.includes("No MultiFormat Readers")) {
        errorMessage = "No QR code found in the image. Please try another file.";
      } else if (error.message.includes("not found")) {
        errorMessage = "File not found or corrupted. Please try again.";
      } else {
        errorMessage = `Scan error: ${error.message}`;
      }

      setCameraError(errorMessage);
      console.error("File scan error:", error);
    } finally {
      setIsFileScanning(false);
    }
  };

  // Handle successful scan
  const handleScanSuccess = (result, scanner) => {
    if (scanner) {
      scanner.clear();
    }
    setScanResult(result);
    setIsScanning(false);
    try {
      const data = tryParseJson(result);
      setName(data?.name || result);
    } catch {
      setName(result);
    }
  };

  // Handle scan errors
  const handleScanError = (error) => {
    console.error('QR scan error:', error);
    setCameraError(
      error.message || 'Failed to access camera. Please check permissions.'
    );
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  // Try to parse JSON data from QR code
  const tryParseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  // Reset scanner state
  const resetScanner = () => {
    setScanResult(null);
    setName('');
    setCameraError(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="scanner-container">
      <h2 className="scanner-title">QR Code Scanner</h2>

      {/* Scanner Options */}
      {!scanResult && (
        <div className="scanner-options">
          <button
            onClick={startScanner}
            disabled={isScanning}
            className={`scan-button ${isScanning ? 'scanning' : 'camera'}`}
          >
            {isScanning ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
                </svg>
                Open Camera
              </>
            )}
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="scan-button upload"
            disabled={isFileScanning}
          >
            {isFileScanning ? (
              <>
                <svg className="spinner" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Upload Image
              </>
            )}
          </button>

          <div className="file-requirements">
            <p>For best results:</p>
            <ul>
              <li>Use clear, well-lit images</li>
              <li>Ensure QR code fills most of the image</li>
              <li>Supported formats: JPG, PNG, GIF</li>
            </ul>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="file-input"
          />
        </div>
      )}

      {/* Error Messages */}
      {cameraError && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" />
          </svg>
          <span>{cameraError}</span>
          <button
            onClick={startScanner}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {/* Camera Scanner */}
      <div id="qr-reader" className={`camera-scanner ${isScanning ? 'active' : ''}`}></div>

      {/* File Scanner (hidden when not used) */}
      <div id="file-qr-reader" className="file-scanner"></div>

      {/* Selected File Info */}
      {selectedFile && isFileScanning && (
        <div className="file-info">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <div>
            <p className="file-name">{selectedFile.name}</p>
            <p className="scan-status">Scanning file...</p>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div className="scan-results">
          <h3>Scan Results</h3>
          <div className="result-content">
            <label>Scanned Content:</label>
            <p className="scanned-data">{scanResult}</p>
          </div>
          {name && (
            <>
              <div className="result-content">
                <label>Extracted Name:</label>
                <p className="extracted-name">{name}</p>
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => alert(`Welcome, ${name}!`)}
                  className="action-button primary"
                >
                  Use this name
                </button>
                <button
                  onClick={resetScanner}
                  className="action-button secondary"
                >
                  Scan Again
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
};

export default QRScannerWithUpload;