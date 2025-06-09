import { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import headerImage from './assets/header.webp';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import domtoimage from 'dom-to-image';
import { jsPDF } from 'jspdf';

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

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    });
};

const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accessibility-report.json';
  a.click();
  URL.revokeObjectURL(url);
};

const exportPDF = () => {
  const node = document.getElementById('scan-results');
  if (!node) return alert("No results to export.");

  domtoimage.toPng(node)
    .then(dataUrl => {
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('accessibility-report.pdf');
    })
    .catch(error => {
      console.error('dom-to-image error:', error);
      alert("Failed to export PDF.");
    });
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
            <div className="flex justify-between items-center mb-4 px-2">
              <h2 className="text-xl font-semibold">
                Issues Found: {results.length}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => exportJSON(results)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportPDF()}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Export PDF
                </button>
              </div>
            </div>
            <ul id="scan-results" className="space-y-4 p-2">
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
                        <div className="flex items-center gap-2">
                          <code className="gap-4 bg-gray-400 my-4 p-1 rounded break-words whitespace-pre-wrap inline-block">
                            {node.html}
                          </code>
                          <button
                            onClick={() => copyToClipboard(node.html)}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Copy
                          </button>
                        </div>
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
