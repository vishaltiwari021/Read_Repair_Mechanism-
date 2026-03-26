import { CheckCircle, AlertCircle, Info, Clock, Activity } from "lucide-react";

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function ActivityTimeline({ logs }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 h-full">
      <div className="card-body p-6">
        <div className="flex items-center gap-2 border-b border-base-200 pb-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="card-title text-lg m-0">Activity Timeline</h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-base-content/50 border border-dashed border-base-300 rounded-xl">
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <p>Run any action to see activity appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[600px] overflow-auto pr-2">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className={`alert shadow-sm flex-col items-start gap-2 ${
                  log.type === "success" ? "bg-success/10 border-success/30" : 
                  log.type === "error" ? "bg-error/10 border-error/30" : 
                  "bg-info/10 border-info/30"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {log.type === "success" && <CheckCircle className="w-5 h-5 text-success" />}
                    {log.type === "error" && <AlertCircle className="w-5 h-5 text-error" />}
                    {log.type === "info" && <Info className="w-5 h-5 text-info" />}
                    <h4 className={`font-bold ${
                      log.type === "success" ? "text-success-content" : 
                      log.type === "error" ? "text-error-content" : 
                      "text-info-content"
                    }`}>{log.title}</h4>
                  </div>
                  <span className="text-xs opacity-70 font-mono bg-base-100/50 px-2 py-1 rounded">{log.time}</span>
                </div>
                
                {log.payload && (
                  <div className="w-full bg-base-100/60 rounded-lg p-3 mt-1 overflow-x-auto border border-base-200/50">
                    <pre className="text-xs font-mono text-base-content/80 whitespace-pre-wrap">
                      {pretty(log.payload)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityTimeline;