export default function LoadingSpinner({
  size = 'md', // 'sm', 'md', 'lg'
  text = 'Scanning threat intelligence...',
  inline = false
}) {
  if (inline) {
    return (
      <span className={`inline-spinner spinner-${size}`}>
        <span className="spinner-ring" />
        {text && <span className="spinner-text">{text}</span>}
      </span>
    );
  }

  return (
    <div className={`cyber-spinner-wrapper spinner-${size}`}>
      <div className="spinner-graphic">
        <div className="pulse-outer" />
        <div className="spinner-core" />
      </div>
      {text && <p className="spinner-label">{text}</p>}
    </div>
  );
}
