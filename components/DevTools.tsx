
import React, { useState, useCallback } from 'react';
import { getPageHtml, getElementContent } from '../services/fetchService';
import { MonitorJob, SelectorType, MonitorStatus } from '../types';

// Icons
const CodeBracketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>;
const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 01-6.23-.693L4.2 15.3m15.6 0c1.258.312 2.086 1.612 2.086 2.91v0a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v0c0-1.298.828-2.598 2.086-2.91m15.6 0a9.026 9.026 0 00-12 0" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;

type Tab = 'fetch' | 'select' | 'monitor';

interface DevToolsProps {
  jobs: MonitorJob[];
  addJob: (job: Omit<MonitorJob, 'id' | 'status' | 'lastContent' | 'lastCheck' | 'message'>) => void;
  removeJob: (id: string) => void;
}

const DevTools: React.FC<DevToolsProps> = ({ jobs, addJob, removeJob }) => {
  const [activeTab, setActiveTab] = useState<Tab>('monitor');

  const TabButton: React.FC<{ tabName: Tab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center font-semibold px-4 py-2 text-sm transition-colors w-full rounded-md ${
        activeTab === tabName ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-3 gap-2 p-2 bg-gray-900/50 border-b border-gray-700 rounded-t-lg">
        <TabButton tabName="fetch" label="Fetch HTML" icon={<CodeBracketIcon />} />
        <TabButton tabName="select" label="Select Content" icon={<BeakerIcon />} />
        <TabButton tabName="monitor" label="Monitor Element" icon={<EyeIcon />} />
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {activeTab === 'fetch' && <HtmlFetcher />}
        {activeTab === 'select' && <ElementSelector />}
        {activeTab === 'monitor' && <MonitoringManager jobs={jobs} addJob={addJob} removeJob={removeJob} />}
      </div>
    </div>
  );
};

// Sub-components for each tab
const HtmlFetcher: React.FC = () => {
    const [url, setUrl] = useState('');
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetch = async () => {
        setLoading(true);
        setError('');
        setHtml('');
        try {
            const result = await getPageHtml(url);
            setHtml(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2 text-blue-400">Fetch Full Page HTML</h3>
            <div className="flex space-x-2">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="input-primary flex-grow" />
                <button onClick={handleFetch} disabled={loading} className="btn-primary">{loading ? 'Fetching...' : 'Fetch'}</button>
            </div>
            {error && <p className="text-red-400 mt-2">{error}</p>}
            {html && <pre className="mt-4 p-2 bg-gray-900 rounded-md text-xs overflow-auto max-h-96 border border-gray-700"><code>{html}</code></pre>}
        </div>
    );
};

const ElementSelector: React.FC = () => {
    const [url, setUrl] = useState('');
    const [selector, setSelector] = useState('');
    const [content, setContent] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetch = async () => {
        setLoading(true);
        setError('');
        setContent([]);
        try {
            const result = await getElementContent(url, selector);
            setContent(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold mb-2 text-blue-400">Get Content by CSS Selector</h3>
            <div className="space-y-2">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="input-primary w-full" />
                <input type="text" value={selector} onChange={e => setSelector(e.target.value)} placeholder=".class, #id, tag" className="input-primary w-full" />
                <button onClick={handleFetch} disabled={loading} className="btn-primary w-full">{loading ? 'Fetching...' : 'Fetch'}</button>
            </div>
            {error && <p className="text-red-400 mt-2">{error}</p>}
            {content.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Found {content.length} element(s):</h4>
                    <ul className="list-disc list-inside bg-gray-900 p-3 rounded-md border border-gray-700 max-h-80 overflow-y-auto">
                        {content.map((item, index) => <li key={index} className="truncate">{item}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};


const MonitoringManager: React.FC<DevToolsProps> = ({ jobs, addJob, removeJob }) => {
    const [url, setUrl] = useState('');
    const [selectorType, setSelectorType] = useState<SelectorType>(SelectorType.ClassName);
    const [selectorValue, setSelectorValue] = useState('');
    const [triggerValue, setTriggerValue] = useState('');
    const [targetApiUrl, setTargetApiUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!url || !selectorValue || !targetApiUrl) {
            alert("Please fill in URL, Selector Value, and Target API URL.");
            return;
        }
        addJob({ url, selectorType, selectorValue, triggerValue, targetApiUrl });
        // Reset form
        setUrl('');
        setSelectorValue('');
        setTriggerValue('');
        setTargetApiUrl('');
    };
    
    const getStatusColor = (status: MonitorStatus) => {
        switch(status) {
            case MonitorStatus.Monitoring: return 'text-blue-400';
            case MonitorStatus.Triggered: return 'text-green-400';
            case MonitorStatus.Error: return 'text-red-400';
            default: return 'text-gray-400';
        }
    }

    return (
        <div>
            <h3 className="text-lg font-bold mb-3 text-blue-400">Create New Monitor Job</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL to Monitor" className="input-primary w-full" />
                <div className="grid grid-cols-2 gap-2">
                    <select value={selectorType} onChange={e => setSelectorType(e.target.value as SelectorType)} className="input-primary">
                        {Object.values(SelectorType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" value={selectorValue} onChange={e => setSelectorValue(e.target.value)} placeholder="Selector Value" className="input-primary" />
                </div>
                <input type="text" value={triggerValue} onChange={e => setTriggerValue(e.target.value)} placeholder="Trigger Value (optional)" className="input-primary w-full" />
                <input type="text" value={targetApiUrl} onChange={e => setTargetApiUrl(e.target.value)} placeholder="Target API URL (POST)" className="input-primary w-full" />
                <button type="submit" className="btn-primary w-full">Add Monitor</button>
            </form>

            <hr className="my-6 border-gray-600" />

            <h3 className="text-lg font-bold mb-3 text-blue-400">Active Monitors ({jobs.length})</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {jobs.length === 0 && <p className="text-gray-400 text-center">No active monitoring jobs.</p>}
                {jobs.map(job => (
                    <div key={job.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-white break-all">{job.url}</p>
                                <p className="text-sm text-gray-300">
                                    Selector: <span className="font-mono bg-gray-700 px-1 rounded">{job.selectorType}: {job.selectorValue}</span>
                                </p>
                            </div>
                            <button onClick={() => removeJob(job.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                <TrashIcon />
                            </button>
                        </div>
                        <div className="mt-2 text-sm">
                           <p className={`font-semibold ${getStatusColor(job.status)}`}>Status: {job.status}</p>
                           {job.message && <p className="text-gray-400 text-xs mt-1">Message: {job.message}</p>}
                           {job.lastCheck && <p className="text-gray-500 text-xs">Last check: {job.lastCheck.toLocaleTimeString()}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DevTools;
