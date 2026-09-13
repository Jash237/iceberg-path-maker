import { useApp } from '../context/AppContext';

export default function Toolbar({ isAddingIceberg, setIsAddingIceberg }) {
  const { icebergs, risks } = useApp();

  const riskCounts = icebergs.reduce(
    (acc, b) => {
      const level = risks[b.id]?.level || 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className={`btn ${isAddingIceberg ? 'btn-active' : 'btn-primary'}`}
          onClick={() => setIsAddingIceberg(!isAddingIceberg)}
        >
          {isAddingIceberg ? '✕ Cancel' : '+ Add Iceberg'}
        </button>
        {isAddingIceberg && (
          <span className="toolbar-hint">Click on the map to place an iceberg</span>
        )}
      </div>
      <div className="toolbar-right">
        <div className="risk-summary">
          {riskCounts.critical > 0 && (
            <span className="risk-chip risk-critical">
              {riskCounts.critical} Critical
            </span>
          )}
          {riskCounts.high > 0 && (
            <span className="risk-chip risk-high">
              {riskCounts.high} High
            </span>
          )}
          {riskCounts.moderate > 0 && (
            <span className="risk-chip risk-moderate">
              {riskCounts.moderate} Moderate
            </span>
          )}
          {riskCounts.low > 0 && (
            <span className="risk-chip risk-low">
              {riskCounts.low} Low
            </span>
          )}
        </div>
        <span className="toolbar-time">
          {new Date().toLocaleTimeString()} UTC
        </span>
      </div>
    </div>
  );
}
