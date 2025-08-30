
import React, { useState, useRef, useCallback } from 'react';

// SVG Icons defined within the component for simplicity
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const ArrowPathIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-3.183l-3.181 3.183m0 0V5.985m0 0l3.181-3.182M5.165 5.165L2 2.001" />
  </svg>
);


interface BrowserProps {}

const Browser: React.FC<BrowserProps> = () => {
  const [url, setUrl] = useState<string>('https://www.wikipedia.org/');
  const [inputValue, setInputValue] = useState<string>('https://www.wikipedia.org/');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = useCallback(() => {
    let finalUrl = inputValue.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    setUrl(finalUrl);
    setIsLoading(true);
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      const iframeUrl = iframeRef.current?.contentWindow?.location.href;
      if (iframeUrl && iframeUrl !== 'about:blank') {
        setInputValue(iframeUrl);
      }
    } catch (error) {
        console.warn("Could not access iframe URL due to cross-origin restrictions.");
    }
  };

  const goBack = () => iframeRef.current?.contentWindow?.history.back();
  const goForward = () => iframeRef.current?.contentWindow?.history.forward();
  const reload = () => iframeRef.current?.contentWindow?.location.reload();

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 shadow-2xl">
      {/* Address Bar */}
      <div className="flex items-center p-2 bg-gray-900/50 border-b border-gray-700 rounded-t-lg">
        <button onClick={goBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><ArrowLeftIcon /></button>
        <button onClick={goForward} className="p-2 rounded-full hover:bg-gray-700 transition-colors ml-1"><ArrowRightIcon /></button>
        <button onClick={reload} className="p-2 rounded-full hover:bg-gray-700 transition-colors ml-1"><ArrowPathIcon /></button>
        <div className="flex-grow mx-4 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter URL and press Enter"
            className="w-full bg-gray-800 text-white px-4 py-2 rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={handleNavigate}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          Go
        </button>
      </div>
      
      {/* Web View */}
      <div className="flex-grow relative bg-gray-900 rounded-b-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse delay-200"></div>
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse delay-400"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title="Web Browser"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          onLoad={handleIframeLoad}
          onError={() => setIsLoading(false)}
        ></iframe>
      </div>
    </div>
  );
};

export default Browser;
