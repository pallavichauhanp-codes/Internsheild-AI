export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon = null,
  required = false,
  className = '',
  disabled = false,
  as = 'input', // 'input' or 'textarea'
  rows = 4,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon-left">{icon}</span>}
        
        {as === 'textarea' ? (
          <textarea
            id={inputId}
            className={`input-field textarea-field ${icon ? 'with-icon' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={`input-field ${icon ? 'with-icon' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        )}
      </div>

      {error ? (
        <span className="input-feedback error-text">{error}</span>
      ) : helperText ? (
        <span className="input-feedback helper-text">{helperText}</span>
      ) : null}
    </div>
  );
}
