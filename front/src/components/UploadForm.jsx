import { useState } from 'react';
import api from '../api';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select image');
    const res = await api.uploadReport({ imageFile: file, location, description });
    if (res.ok) {
      const a = await api.analyzeWithAI({ imageUrl: res.report.imageUrl, location, description });
      setAnalysis(a.analysis);
      alert('Report uploaded. Analysis shown below.');
    }
  };

  return (
    <div className="max-w-2xl bg-white p-4 rounded shadow">
      <form onSubmit={submit} className="space-y-3">
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <input className="w-full p-2 border rounded" placeholder="Location (text)" value={location} onChange={e=>setLocation(e.target.value)} />
 ../components/NavBar       <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="bg-green-600 text-white py-2 px-4 rounded">Upload</button>
      </form>

      {analysis && (
        <div className="mt-4 p-3 border rounded">
          <h3 className="font-semibold">AI Analysis</h3>
          <p><strong>Category:</strong> {analysis.category}</p>
          <p><strong>Severity:</strong> {analysis.severity}</p>
          <p><strong>Recommendation:</strong> {analysis.recommendedAction}</p>
          <p className="text-sm text-gray-600">{analysis.notes}</p>
        </div>
      )}

    </div>   

  );
}
