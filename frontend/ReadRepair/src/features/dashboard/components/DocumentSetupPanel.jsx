function DocumentSetupPanel({
  docId,
  name,
  balance,
  newBalance,
  onDocIdChange,
  onNameChange,
  onBalanceChange,
  onNewBalanceChange,
}) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 lg:col-span-2 xl:col-span-1">
      <div className="card-body p-6">
        <h3 className="card-title text-lg border-b border-base-200 pb-2 mb-2">Document Setup</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Document ID</span></label>
            <input className="input input-bordered input-sm h-10" value={docId} onChange={(e) => onDocIdChange(e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">User Name</span></label>
            <input className="input input-bordered input-sm h-10" value={name} onChange={(e) => onNameChange(e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Initial Balance</span></label>
            <input type="number" className="input input-bordered input-sm h-10" value={balance} onChange={(e) => onBalanceChange(e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Updated Balance</span></label>
            <input type="number" className="input input-bordered input-sm h-10" value={newBalance} onChange={(e) => onNewBalanceChange(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentSetupPanel;