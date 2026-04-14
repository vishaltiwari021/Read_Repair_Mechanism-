function pretty(value) {
  return JSON.stringify(value, null, 2);
}

function OutputPanel({ title, value, emptyMessage }) {
  const hasValue = value !== null && value !== undefined;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 h-full">
      <div className="card-body p-6 flex flex-col h-full">
        <h3 className="card-title text-lg border-b border-base-200 pb-2 mb-2">{title}</h3>
        <div className="grow bg-neutral text-neutral-content rounded-xl overflow-hidden shadow-inner">
          <div className="px-4 py-2 bg-neutral/70 border-b border-neutral-content/10 flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-xs opacity-50 ml-2 font-mono">Output</span>
          </div>
          <div className="p-4 overflow-auto max-h-[300px]">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {hasValue ? pretty(value) : <span className="text-neutral-content/50 italic">{emptyMessage}</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OutputPanel;