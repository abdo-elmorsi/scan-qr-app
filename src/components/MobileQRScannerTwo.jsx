import { useState } from 'react';
import QrReader from 'react-qr-reader';

const MobileQRScannerTwo = () => {
  const [name, setName] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data) => {
    if (data) {
      setShowScanner(false);
      setName(data);
    }
  };

  const handleError = (err) => {
    console.error('QR Error:', err);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {!showScanner ? (
        <button 
          onClick={() => setShowScanner(true)}
          style={buttonStyle}
        >
          Start Scanner
        </button>
      ) : (
        <>
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            facingMode="environment"
          />
          <button 
            onClick={() => setShowScanner(false)}
            style={{ ...buttonStyle, background: '#dc3545' }}
          >
            Cancel
          </button>
        </>
      )}
      
      {name && (
        <div style={{ marginTop: '20px' }}>
          <p>Scanned: {name}</p>
          <button 
            onClick={() => alert(`Hello ${name}!`)}
            style={buttonStyle}
          >
            Use Name
          </button>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  margin: '10px',
  cursor: 'pointer'
};

export default MobileQRScannerTwo;