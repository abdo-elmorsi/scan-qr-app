import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const MobileQRScannerThree = () => {
  const [name, setName] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  const startScanner = () => {
    setIsScanning(true);
    setCameraError(null);
    
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

  const handleScanSuccess = (result, scanner) => {
    scanner.clear();
    setScanResult(result);
    setIsScanning(false);
    try {
      const data = tryParseJson(result);
      setName(data?.name || result);
    } catch {
      setName(result);
    }
  };

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

  const tryParseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setName('');
    setCameraError(null);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      {!isScanning && !scanResult && (
        <button
          onClick={startScanner}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Open QR Scanner
        </button>
      )}

      {cameraError && (
        <div style={{ color: 'red', margin: '10px 0' }}>
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
            Retry
          </button>
        </div>
      )}

      <div id="qr-reader" style={{ width: '100%', display: isScanning ? 'block' : 'none' }}></div>
      
      {scanResult && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Scanned Result:</strong> {scanResult}
          </p>
          {name && (
            <>
              <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                <strong>Extracted Name:</strong> {name}
              </p>
              <div>
                <button 
                  onClick={() => alert(`Welcome, ${name}!`)}
                  style={{
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
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
                    cursor: 'pointer'
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

export default MobileQRScannerThree;