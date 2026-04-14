
import { PlayCircle, ShieldAlert, Zap, FilePlus, RefreshCcw, Activity, Settings2 } from "lucide-react";

function ActionsPanel({ loadingAction, actions }) {
  const isBusy = Boolean(loadingAction);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 text-base-content w-full">
      <div className="card-body p-6">
        <div className="flex justify-between items-center border-b border-base-200 pb-3 mb-4">
          <h3 className="card-title text-lg m-0">System Actions</h3>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${isBusy ? 'bg-warning/20 text-warning-content' : 'bg-success/20 text-success-content'}`}>
            {isBusy ? <span className="flex items-center gap-2"><span className="loading loading-spinner w-3 h-3"></span> {loadingAction}</span> : "Ready for next action"}
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="btn btn-primary" onClick={actions.createDocument} disabled={isBusy}>
            <FilePlus className="w-4 h-4" /> Create
          </button>
          <button className="btn btn-outline" onClick={actions.updateDocument} disabled={isBusy}>
            <RefreshCcw className="w-4 h-4" /> Update
          </button>
          <button className="btn btn-warning" onClick={actions.simulateStale} disabled={isBusy}>
            <ShieldAlert className="w-4 h-4" /> Simulate Stale
          </button>
          <button className="btn btn-success text-success-content" onClick={actions.readDocument} disabled={isBusy}>
            <Zap className="w-4 h-4" /> Read + Repair
          </button>
          <button className="btn btn-ghost border border-base-300" onClick={actions.loadMetrics} disabled={isBusy}>
            <Activity className="w-4 h-4" /> Metrics
          </button>
          <button className="btn btn-ghost border border-base-300" onClick={actions.fullRepair} disabled={isBusy}>
            <Settings2 className="w-4 h-4" /> Full Repair
          </button>
          <button className="btn btn-secondary col-span-2" onClick={actions.runGuidedDemo} disabled={isBusy}>
            <PlayCircle className="w-4 h-4" /> Guided Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionsPanel;