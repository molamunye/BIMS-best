import { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export function ImageWithFallback({
    src,
    fallbackSrc = '/placeholder.svg',
    alt,
    ...props
}: ImageWithFallbackProps) {
    const [error, setError] = useState(false);

    return (
        <img
            src={error ? fallbackSrc : src}
            alt={alt}
            onError={() => setError(true)}
            {...props}
        />
    );
}
