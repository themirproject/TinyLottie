import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

interface LottiePreviewProps {
  animationData: any;
  className?: string;
}

export function LottiePreview({ animationData, className = '' }: LottiePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || !animationData) return;

    // Clear previous animation
    if (animationRef.current) {
      animationRef.current.destroy();
    }

    // Load new animation
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animationData,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [animationData]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
    />
  );
}
