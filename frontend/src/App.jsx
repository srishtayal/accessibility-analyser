import { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import headerImage from './assets/header.webp';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);

  const scanSite = async () => {
    if (!url) return alert("Please enter a website URL.");
    NProgress.start();
    try {
      const res = await axios.get(`http://localhost:5000/scan?url=${encodeURIComponent(url)}`);
      setResults(res.data.violations || res.data); // works with both backend formats
    } catch (err) {
      console.error(err);
      alert("Failed to scan: " + err.message);
    } finally {
      NProgress.done();
    }
  };

  const getImpactBadgeColor = (impact) => {
  switch (impact) {
    case 'critical': return 'bg-red-600 text-white';
    case 'serious': return 'bg-orange-500 text-white';
    case 'moderate': return 'bg-yellow-400 text-black';
    case 'minor': return 'bg-gray-300 text-black';
    default: return 'bg-gray-200 text-black';
  }
};


  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <Navbar />
      </div>

      <div className="pt-40 px-4 max-w-4xl mx-auto font-sans flex flex-col items-center">
        <img src={headerImage} alt="Logo" className="w-52 h-52 mb-6" />
        <h1 className="text-4xl font-bold mb-4 text-center">
          Find out if your website is <span className='text-blue-400'>Accessible</span> and <span className='text-blue-400'>Compliant</span>
        </h1>
        
        <div className='flex flex-row justify-center items-center gap-4 p-4 w-full max-w-2xl'>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL"
            className="border px-4 py-2 rounded w-full"
          />
          <button
            onClick={scanSite}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Scan
          </button>
        </div>

        {results && (
          <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold mb-4">Issues Found: {results.length}</h2>
            <ul className="space-y-4 p-2">
              {results.map((violation, i) => (
                <li key={i} className="border p-3 rounded shadow overflow-x-auto">
                  <strong className="block text-lg">{violation.id}</strong>
                  <p className="text-sm text-gray-300">{violation.description}</p>
                  {violation.impact && (
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${getImpactBadgeColor(violation.impact)}`}
                    >
                      {violation.impact.toUpperCase()}
                    </span>
                  )}
                  <ul className="ml-4 mt-2 p-2 list-disc text-sm text-red-800">
                    {violation.nodes.map((node, j) => (
                      <li key={j}>
                        <code className="bg-gray-100 p-1 rounded break-words whitespace-pre-wrap inline-block">
                          {node.html}
                        </code>
                      </li>
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
