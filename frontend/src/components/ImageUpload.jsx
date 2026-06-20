import { useState, useRef } from 'react';

const ImageUpload = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    
    // Check type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    
    // Check size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onUpload(file);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border border-dashed rounded-xl p-8 flex flex-col items-center justify-center min-h-[320px] transition duration-200 ${
            dragActive ? 'border-slate-950 bg-slate-800' : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            id="image-upload-input"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleChange}
            disabled={isLoading}
          />

          {!preview ? (
            <div className="flex flex-col items-center text-center cursor-pointer w-full py-8" onClick={() => fileInputRef.current?.click()}>
              <svg className="w-10 h-10 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-200 font-semibold mb-1">
                Drop an image here, or <span className="underline">browse</span>
              </p>
              <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP up to 10MB</p>
            </div>
          ) : (
            <div className="relative w-full max-h-[300px] flex justify-center items-center overflow-hidden rounded-lg">
              <img src={preview} alt="Upload Preview" className="max-h-[300px] max-w-full object-contain rounded-lg shadow-md" />
              {!isLoading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-white rounded-full p-1.5 transition"
                  title="Remove image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {preview && (
          <button
            type="submit"
            disabled={isLoading || !file}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-slate-950 text-center transition duration-200 flex items-center justify-center gap-2 ${
              isLoading || !file
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'minimal-primary active:scale-[0.99]'
            }`}
          >
            {isLoading ? 'Processing Analysis...' : 'Analyze Vehicle Image'}
          </button>
        )}
      </form>
    </div>
  );
};

export default ImageUpload;
