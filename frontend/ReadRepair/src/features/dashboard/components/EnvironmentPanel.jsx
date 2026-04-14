function EnvironmentPanel({ apiBaseUrl, onApiBaseUrlChange }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-lg border-b border-base-200 pb-2 mb-2">Environment</h3>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-base-content/70 font-medium">Backend API base URL</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full h-10"
            value={apiBaseUrl}
            onChange={(event) => onApiBaseUrlChange(event.target.value)}
            placeholder="/api or http://localhost:3000"
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">
              Use <code>/api</code> in Vite dev mode or a full backend URL.
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentPanel;