
import React, { useState, useEffect, useCallback } from 'react';
import Browser from './components/Browser';
import DevTools from './components/DevTools';
import { MonitorJob, SelectorType, MonitorStatus } from './types';
import { getElementContent } from './services/fetchService';

function App() {
  const [jobs, setJobs] = useState<MonitorJob[]>([]);

  const addJob = useCallback((newJobData: Omit<MonitorJob, 'id' | 'status' | 'lastContent' | 'lastCheck' | 'message'>) => {
    const newJob: MonitorJob = {
      ...newJobData,
      id: new Date().toISOString() + Math.random(),
      status: MonitorStatus.Monitoring,
      lastContent: null,
      lastCheck: null,
      message: 'Initializing...',
    };
    setJobs(prevJobs => [...prevJobs, newJob]);
  }, []);

  const removeJob = useCallback((id: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<MonitorJob>) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === id ? { ...job, ...updates } : job));
  }, []);

  const checkJob = useCallback(async (job: MonitorJob) => {
    let selector = '';
    switch(job.selectorType) {
        case SelectorType.ClassName: selector = `.${job.selectorValue}`; break;
        case SelectorType.Id: selector = `#${job.selectorValue}`; break;
        case SelectorType.TagName: selector = job.selectorValue; break;
    }

    try {
        const contents = await getElementContent(job.url, selector);
        const currentContent = contents.length > 0 ? contents[0] : null;

        let message = `Found content: "${currentContent ? currentContent.slice(0, 50) + '...' : 'null'}"`;
        let status = job.status;

        if (job.lastContent !== null && currentContent !== job.lastContent) {
            message = `Content changed from "${job.lastContent?.slice(0, 30)}..." to "${currentContent?.slice(0, 30)}..."`;
            
            const triggerConditionMet = !job.triggerValue || currentContent === job.triggerValue;

            if (triggerConditionMet) {
                status = MonitorStatus.Triggered;
                message += `. Trigger condition met. Firing API call.`;
                
                // Fire API call
                try {
                    await fetch(job.targetApiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jobId: job.id,
                            url: job.url,
                            selector: `${job.selectorType}: ${job.selectorValue}`,
                            previousContent: job.lastContent,
                            newContent: currentContent,
                            timestamp: new Date().toISOString()
                        }),
                    });
                } catch (apiError: any) {
                    message += ` API call failed: ${apiError.message}`;
                    status = MonitorStatus.Error;
                }
            }
        }
        
        updateJob(job.id, { lastContent: currentContent, status, message, lastCheck: new Date() });

    } catch (e: any) {
        updateJob(job.id, { status: MonitorStatus.Error, message: e.message, lastCheck: new Date() });
    }
  }, [updateJob]);

  useEffect(() => {
    const runChecks = () => {
        jobs.forEach(job => {
            if (job.status === MonitorStatus.Monitoring || job.status === MonitorStatus.Error) { // Retry on error
                checkJob(job);
            }
        });
    };
    
    runChecks(); // Initial check on load/job add
    const intervalId = setInterval(runChecks, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs, checkJob]);


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <style>{`
        .input-primary { background-color: #1F2937; border: 1px solid #4B5563; padding: 0.5rem 1rem; border-radius: 0.375rem; color: white; transition: border-color 0.2s; }
        .input-primary:focus { outline: none; border-color: #3B82F6; }
        .btn-primary { background-color: #2563EB; color: white; font-weight: 600; padding: 0.5rem 1.5rem; border-radius: 0.375rem; transition: background-color 0.2s; }
        .btn-primary:hover { background-color: #1D4ED8; }
        .btn-primary:disabled { background-color: #4B5563; cursor: not-allowed; }
      `}</style>
      <main className="h-[calc(100vh-2rem)] grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
            <Browser />
        </div>
        <div className="lg:col-span-1">
            <DevTools jobs={jobs} addJob={addJob} removeJob={removeJob}/>
        </div>
      </main>
    </div>
  );
}

export default App;
