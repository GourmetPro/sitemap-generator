import React, { useState } from 'react';
import './App.css';

function App() {
  const [xmlContent, setXmlContent] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      processXML(text);
    };
    reader.readAsText(file);
  };

  const processXML = (xml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "application/xml");
    const urls = xmlDoc.getElementsByTagName('url');

    const urlsToRemove = [];
    for (let i = 0; i < urls.length; i++) {
      const loc = urls[i].getElementsByTagName('loc')[0].textContent;
      if (
        loc.includes('/market/disabled-') ||
        loc.includes('/profile') ||
        loc.trim() === 'https://www.gourmetpro.co/schedule'
      ) {
        urlsToRemove.push(urls[i]);
      }
    }

    urlsToRemove.forEach(url => url.parentNode.removeChild(url));

    // Serialize XML with proper formatting
    const serializer = new XMLSerializer();
    let newXml = serializer.serializeToString(xmlDoc);

    // Add missing line break after XML declaration
    newXml = newXml.replace(
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?xml version="1.0" encoding="UTF-8"?>\n'
    );

    // Remove any empty lines
    newXml = newXml.split('\n').filter(line => line.trim() !== '').join('\n');

    setXmlContent(newXml);
    downloadXML(newXml);
  };

  const downloadXML = (content) => {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleaned-sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    const html = document.documentElement;
    if (!isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  };

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="absolute top-4 right-4 flex items-center">
        <span className="mr-2">Dark Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer dark:bg-gray-600 peer-focus:ring-blue-300 peer-checked:bg-blue-600">
          </div>
          <span className="sr-only">Toggle Dark Mode</span>
        </label>
      </div>
      <h1 className="text-3xl font-bold mb-8">GourmetPro Sitemap Cleaner</h1>
      <div
        className="drop-zone border-2 border-dashed border-gray-600 rounded-lg p-10 w-96 flex flex-col items-center justify-center cursor-pointer transition bg-gray-800 hover:border-gray-400"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="mb-4">Drag and drop your sitemap.xml here</p>
        <p className="mb-4">or</p>
        <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer">
          Upload XML
          <input
            type="file"
            accept=".xml"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

export default App;