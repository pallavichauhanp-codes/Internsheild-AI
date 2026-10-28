export default function Card({
  children,
  title,
  subtitle,
  icon = null,
  badge = null,
  action = null,
  hoverable = false,
  glass = true,
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'card-component',
    glass ? 'glass-card' : 'solid-card',
    hoverable ? 'card-hoverable' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {(title || icon || badge || action) && (
        <div className="card-header">
          <div className="card-header-main">
            {icon && <div className="card-header-icon">{icon}</div>}
            <div>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="card-header-extras">
            {badge && <div className="card-badge">{badge}</div>}
            {action && <div className="card-action">{action}</div>}
          </div>
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
}
