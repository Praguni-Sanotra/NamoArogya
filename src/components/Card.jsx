/**
 * Reusable Card Component
 * For dashboard widgets and content containers
 */

const Card = ({
    children,
    className = '',
    title,
    subtitle,
    action,
    hover = false
}) => {
    return (
        <div
            className={`card ${hover ? 'hover:shadow-card-hover' : ''} ${className}`}
        >
            {/* Card Header */}
            {(title || action) && (
                <div className="flex items-center justify-between mb-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-neutral-900">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-neutral-500 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}

            {/* Card Content */}
            <div>{children}</div>
        </div>
    );
};

export default Card;
