import { ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

export default function RiskBadge({ level, score, showIcon = true, size = 'md' }) {
  const normalized = (level || '').toUpperCase();

  let type = 'neutral';
  let label = level || 'UNKNOWN';
  let Icon = HelpCircle;

  if (normalized.includes('HIGH') || normalized.includes('SCAM') || normalized.includes('FRAUD') || normalized.includes('CONFIRMED')) {
    type = 'danger';
    label = score ? `HIGH RISK (${score}/100)` : (level || 'HIGH RISK');
    Icon = ShieldAlert;
  } else if (normalized.includes('MODERATE') || normalized.includes('SUSPICIOUS') || normalized.includes('REVIEW')) {
    type = 'warning';
    label = score ? `MODERATE (${score}/100)` : (level || 'SUSPICIOUS');
    Icon = AlertTriangle;
  } else if (normalized.includes('SAFE') || normalized.includes('VERIFIED') || normalized.includes('AUTHENTIC')) {
    type = 'safe';
    label = score ? `SAFE (${score}/100)` : (level || 'VERIFIED');
    Icon = ShieldCheck;
  }

  return (
    <span className={`risk-badge badge-${type} badge-${size}`}>
      {showIcon && <Icon size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} className="risk-badge-icon" />}
      <span>{label}</span>
    </span>
  );
}
