import React, { useMemo, useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt = '', ...rest }) => {
  const [errored, setErrored] = useState(false);

  const fallbackSrc = useMemo(() => {
    // Use BASE_URL so it works on GitHub Pages with non-root base
    return `${import.meta.env.BASE_URL}no-image.svg`;
  }, []);

  const isFallback = errored || !src;
  const effectiveSrc = isFallback ? fallbackSrc : src;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
      style={{
        background: isFallback ? '#fff' : undefined,
        objectFit: isFallback ? 'contain' : undefined,
        ...('style' in rest ? (rest as any).style : {}),
      }}
      {...rest}
    />
  );
};

export default SafeImage;


