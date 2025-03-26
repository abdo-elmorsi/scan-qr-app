import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5Qrcode } from 'html5-qrcode';

const QRScannerWithUpload = () => {
  const [name, setName] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);

  // Initialize QR code scanner
  const startScanner = () => {
    setIsScanning(true);
    setCameraError(null);
    setSelectedFile(null);

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
      setIsScanning(false);
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      scanQRFromFile(file);
    }
  };

  // Scan QR code from uploaded file
  const scanQRFromFile = (file) => {
    const html5QrCode = new Html5Qrcode("file-qr-reader");

    html5QrCode.scanFile(file, false)
      .then(result => {
        handleScanSuccess(result, null);
      })
      .catch(error => {
        setCameraError("Failed to scan QR code from file: " + error);
        console.error("File scan error:", error);
      });
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
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Code Scanner</h2>

      {/* Scanner Options */}
      {!scanResult && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={startScanner}
            disabled={isScanning}
            style={{
              padding: '12px 24px',
              background: isScanning ? '#cccccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {isScanning ? 'Scanning...' : 'Open Camera'}
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Upload QR Image
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Error Messages */}
      {cameraError && (
        <div style={{
          color: 'red',
          margin: '10px 0',
          padding: '10px',
          background: '#ffeeee',
          borderRadius: '4px'
        }}>
          {cameraError}
          <button
            onClick={startScanner}
            style={{
              marginLeft: '10px',
              padding: '8px 12px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* Camera Scanner */}
      <div id="qr-reader" style={{
        width: '100%',
        display: isScanning ? 'block' : 'none',
        marginBottom: '20px'
      }}></div>

      {/* File Scanner (hidden when not used) */}
      <div id="file-qr-reader" style={{ display: 'none' }}></div>

      {/* Selected File Info */}
      {selectedFile && !scanResult && (
        <div style={{ margin: '10px 0', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <p>Selected file: {selectedFile.name}</p>
          <p>Scanning...</p>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginTop: 0 }}>Scan Results</h3>
          <p style={{ fontSize: '16px', marginBottom: '10px', wordBreak: 'break-all' }}>
            <strong>Scanned Content:</strong> {scanResult}
          </p>
          {name && (
            <>
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                <strong>Extracted Name:</strong> {name}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => alert(`Welcome, ${name}!`)}
                  style={{
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Use this name
                </button>
                <button
                  onClick={resetScanner}
                  style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1
                  }}
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