import { useState } from 'react';
import Scanner from 'react-qr-barcode-scanner';

const MobileQRScanner = () => {
	const [name, setName] = useState('');
	const [startScan, setStartScan] = useState(false);

	return (
		<div>
			<button onClick={() => setStartScan(!startScan)}>
				{startScan ? 'Stop Scan' : 'Start Scan'}
			</button>

			{startScan && (
				<>
					<Scanner
						onResult={(result, error) => {
							if (result) {
								setName(result?.text);
								setStartScan(false);
							}
							if (error) {
								console.info(error);
							}
						}}
						constraints={{ facingMode: 'environment' }}
					/>
				</>
			)}

			{name && (
				<div>
					<p>Scanned Name: {name}</p>
					<button onClick={() => alert(`Welcome, ${name}!`)}>
						Use this name
					</button>
				</div>
			)}
		</div>
	);
};
export default MobileQRScanner