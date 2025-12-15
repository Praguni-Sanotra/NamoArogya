/**
 * Reusable Input Component
 * Form input with validation states
 */

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    icon: Icon,
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-neutral-700 mb-2"
                >
                    {label}
                    {required && <span className="text-accent-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}

                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input ${Icon ? 'pl-10' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-accent-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
