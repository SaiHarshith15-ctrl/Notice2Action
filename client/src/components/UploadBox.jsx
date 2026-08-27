import React, { useRef, useState } from 'react';

export default function UploadBox({ onFileSelected, selectedFile, onClear }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-card border-2 border-dashed p-8 text-center transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-cardborder bg-cardbg dark:bg-[#1C1B3A] dark:border-[#2A2953]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
      />
      {selectedFile ? (
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">📄</span>
          <div className="text-left">
            <p className="font-semibold text-navy dark:text-white text-sm">{selectedFile.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="text-xs text-danger hover:underline"
            >
              Remove file
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-3xl mb-2">📎</div>
          <p className="font-semibold text-navy dark:text-white">Drop a PDF or image here</p>
          <p className="text-sm text-muted mt-1">or click to browse — max 10MB</p>
        </>
      )}
    </div>
  );
}
