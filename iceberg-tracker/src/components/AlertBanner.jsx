import { useApp } from '../context/AppContext';

export default function AlertBanner() {
  const { icebergs, risks } = useApp();

  const criticalAlerts = icebergs.filter(
    (b) => risks[b.id]?.level === 'critical' || risks[b.id]?.level === 'high'
  );

  if (criticalAlerts.length === 0) return null;

  return (
    <div className="alert-banner">
      <div className="alert-icon">⚠️</div>
      <div className="alert-content">
        <strong>COLLISION WARNING</strong>
        <span>
          {criticalAlerts.length} iceberg{criticalAlerts.length > 1 ? 's' : ''}{' '}
          in danger zone:{' '}
          {criticalAlerts
            .map(
              (b) =>
                `${b.name} (${risks[b.id].distanceNmi} nmi - ${risks[b.id].level})`
            )
            .join(', ')}
        </span>
      </div>
    </div>
  );
}
