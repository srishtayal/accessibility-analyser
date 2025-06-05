import { useState } from 'react';
import axios from 'axios';

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
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-4">Accessibility Analyzer</h1>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
        className="border px-4 py-2 rounded w-full max-w-md"
      />
      <button
        onClick={scanSite}
        className="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700"
      >
        Scan
      </button>

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
  );
}

export default App;
