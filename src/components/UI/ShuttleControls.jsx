import { useWarehouseStore } from '../../store/warehouseStore';
import { Camera, Eye, Maximize, PackagePlus, Monitor, Upload, Download, RefreshCw, ArrowRight, Repeat } from 'lucide-react';
import { useState } from 'react';

export default function ShuttleControls() {
  const activeShuttleId = useWarehouseStore((state) => state.activeShuttleId);
  const setActiveShuttle = useWarehouseStore((state) => state.setActiveShuttle);
  const cameraMode = useWarehouseStore((state) => state.cameraMode);
  const setCameraMode = useWarehouseStore((state) => state.setCameraMode);
  const processInboundRequest = useWarehouseStore((state) => state.processInboundRequest);
  const processOutboundRequest = useWarehouseStore((state) => state.processOutboundRequest);
  const processTransferRequest = useWarehouseStore((state) => state.processTransferRequest);
  const shuttleBusy = useWarehouseStore((state) => state.shuttleBusy);

  const [targetLevel, setTargetLevel] = useState(1);
  const [taskType, setTaskType] = useState('INBOUND'); // INBOUND, OUTBOUND, TRANSFER
  const [transferFrom, setTransferFrom] = useState(6);
  const [transferTo, setTransferTo] = useState(8);

  const handleTask = (row) => {
    if (taskType === 'INBOUND') {
      processInboundRequest(row, targetLevel);
    } else if (taskType === 'OUTBOUND') {
      processOutboundRequest(row, targetLevel);
    }
  };

  const handleTransfer = () => {
    processTransferRequest(transferFrom, targetLevel, transferTo, targetLevel);
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 p-6 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-200 dark:border-gray-700 flex gap-8 items-end">

      {/* Camera Controls */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Camera</h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setCameraMode('OVERVIEW')}
            title="Overview"
            className={`p-2 rounded-md transition-all ${
              cameraMode === 'OVERVIEW'
                ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Maximize size={20} />
          </button>
          <button
            onClick={() => setCameraMode('FOLLOW')}
            title="Follow Shuttle"
            className={`p-2 rounded-md transition-all ${
              cameraMode === 'FOLLOW'
                ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Camera size={20} />
          </button>
          <button
            onClick={() => setCameraMode('FREE')}
            title="Free Cam"
            className={`p-2 rounded-md transition-all ${
              cameraMode === 'FREE'
                ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Shuttle Selection (Camera Focus) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active View</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveShuttle('SHUTTLE_1')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeShuttleId === 'SHUTTLE_1'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Monitor size={16} />
            Shuttle 1
          </button>
          <button
            onClick={() => setActiveShuttle('SHUTTLE_2')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeShuttleId === 'SHUTTLE_2'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Monitor size={16} />
            Shuttle 2
          </button>
        </div>
      </div>

      {/* Task Control */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task Control</h3>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-md">
                <button onClick={() => setTaskType('INBOUND')} className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${taskType === 'INBOUND' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>
                    <Download size={12} /> In
                </button>
                <button onClick={() => setTaskType('OUTBOUND')} className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${taskType === 'OUTBOUND' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>
                    <Upload size={12} /> Out
                </button>
                <button onClick={() => setTaskType('TRANSFER')} className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${taskType === 'TRANSFER' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>
                    <RefreshCw size={12} /> Move
                </button>
            </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Level Selector */}
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(Number(e.target.value))}
            className="px-2 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
          >
            <option value={1}>Lvl 1</option>
            <option value={2}>Lvl 2</option>
            <option value={3}>Lvl 3</option>
            <option value={4}>Lvl 4</option>
          </select>

          {taskType === 'TRANSFER' ? (
             // Transfer Controls
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <input
                    type="number"
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(Number(e.target.value))}
                    className="w-12 px-1 py-1 text-center rounded bg-white dark:bg-gray-600 text-sm"
                    placeholder="From"
                />
                <ArrowRight size={14} className="text-gray-400" />
                <input
                    type="number"
                    value={transferTo}
                    onChange={(e) => setTransferTo(Number(e.target.value))}
                    className="w-12 px-1 py-1 text-center rounded bg-white dark:bg-gray-600 text-sm"
                    placeholder="To"
                />
                <button
                    onClick={handleTransfer}
                    disabled={shuttleBusy['SHUTTLE_1'] || shuttleBusy['SHUTTLE_2']}
                    className="bg-purple-600 text-white p-1.5 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                </button>
             </div>
          ) : (
             // Inbound/Outbound Controls
             <div className="flex gap-2">
                <button
                    onClick={() => handleTask(6)}
                    disabled={shuttleBusy['SHUTTLE_1']}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    shuttleBusy['SHUTTLE_1']
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : taskType === 'INBOUND'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700'
                            : 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700'
                    }`}
                    title="Run 1 task on Shuttle 1"
                >
                    {shuttleBusy['SHUTTLE_1'] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        taskType === 'INBOUND' ? <Download size={18} /> : <Upload size={18} />
                    )}
                    Shuttle 1
                </button>

                <button
                    onClick={() => handleTask(18)}
                    disabled={shuttleBusy['SHUTTLE_2']}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    shuttleBusy['SHUTTLE_2']
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : taskType === 'INBOUND'
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700'
                            : 'bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700'
                    }`}
                    title="Run 1 task on Shuttle 2"
                >
                    {shuttleBusy['SHUTTLE_2'] ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        taskType === 'INBOUND' ? <Download size={18} /> : <Upload size={18} />
                    )}
                    Shuttle 2
                </button>
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
