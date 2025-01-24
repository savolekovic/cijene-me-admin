import React, { useState, useEffect } from 'react';
import { FaBox } from 'react-icons/fa';

interface ProductImageProps {
  imageUrl: string | null;
  name: string;
  size?: 'small' | 'large';
}

const Placeholder: React.FC<{ size: 'small' | 'large' }> = ({ size }) => {
  const dimensions = size === 'small' ? 
    { width: '50px', height: '50px', iconSize: 24 } : 
    { width: '60px', height: '60px', iconSize: 28 };

  return (
    <div 
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <FaBox size={dimensions.iconSize} className="text-muted" />
    </div>
  );
};

export const ProductImage: React.FC<ProductImageProps> = ({ 
  imageUrl, 
  name, 
  size = 'small' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const dimensions = size === 'small' ? 
    { width: '50px', height: '50px' } : 
    { width: '60px', height: '60px' };

  // Check if image exists when component mounts or imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setHasError(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);
  
  if (hasError || !imageUrl) {
    return <Placeholder size={size} />;
  }

  return (
    <div style={{ 
      width: dimensions.width, 
      height: dimensions.height, 
      position: 'relative'
    }}>
      {isLoading && <Placeholder size={size} />}
      <img 
        src={imageUrl} 
        alt={name}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height, 
          objectFit: 'cover',
          borderRadius: '4px',
          position: isLoading ? 'absolute' : 'static',
          top: 0,
          left: 0,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    </div>
  );
}; 