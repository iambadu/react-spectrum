import React, {forwardRef} from 'react';
import {Image as RNImage, type ImageProps as RNImageProps} from 'react-native';
import {cn} from '../../styles/cn';

const UniwindImage = RNImage as any;

export interface ImageProps extends Omit<RNImageProps, 'accessibilityLabel'> {
  alt?: string;
  className?: string;
  isHidden?: boolean;
}

export const Image = forwardRef<React.ElementRef<typeof RNImage>, ImageProps>(
  function Image({alt, className, isHidden, ...props}, ref) {
    return (
      <UniwindImage
        {...props}
        accessibilityElementsHidden={isHidden || undefined}
        accessibilityLabel={alt}
        accessibilityRole={alt ? 'image' : undefined}
        className={cn('overflow-hidden rounded-md bg-gray-200', className)}
        importantForAccessibility={isHidden ? 'no-hide-descendants' : undefined}
        ref={ref}
      />
    );
  }
);
