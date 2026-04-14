function ReplicaDriftPanel({
  staleReplica,
  staleVersion,
  onStaleReplicaChange,
  onStaleVersionChange,
}) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-6">
        <h3 className="card-title text-lg border-b border-base-200 pb-2 mb-2">Replica Drift</h3>
        <div className="flex gap-4">
          <div className="form-control w-1/2">
            <label className="label"><span className="label-text">Replica Index</span></label>
            <input
              type="number"
              min="0"
              className="input input-bordered input-sm h-10 w-full"
              value={staleReplica}
              onChange={(e) => onStaleReplicaChange(e.target.value)}
            />
          </div>
          <div className="form-control w-1/2">
            <label className="label"><span className="label-text">Target Version</span></label>
            <input
              type="number"
              min="1"
              className="input input-bordered input-sm h-10 w-full"
              value={staleVersion}
              onChange={(e) => onStaleVersionChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplicaDriftPanel;