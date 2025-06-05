import { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import headerImage from './assets/header.webp';

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);

  const scanSite = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/scan?url=${encodeURIComponent(url)}`);
      setResults(res.data.violations);
    } catch (err) {
      alert("Failed to scan: " + err.message);
    }
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <Navbar />
      </div>

      
      <div className="p-36 font-sans flex flex-col justify-center items-center">
        <img src={headerImage} alt="Logo" className="w-52 h-52 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Find out if your website is <span className='text-blue-400'>Accessible</span> and <span className='text-blue-400'>Compliant</span></h1>
        <div className='flex flex-row justify-center items-center gap-4 p-4'>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL"
            className="border px-4 py-2 rounded w-full max-w-md"
          />
          <button
            onClick={scanSite}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Scan
          </button>
        </div>

        {results && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Issues Found: {results.length}</h2>
            <ul className="space-y-2">
              {results.map((violation, i) => (
                <li key={i} className="border p-3 rounded shadow">
                  <strong>{violation.id}</strong>: {violation.description}
                  <ul className="ml-4 list-disc">
                    {violation.nodes.map((node, j) => (
                      <li key={j}><code>{node.html}</code></li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
