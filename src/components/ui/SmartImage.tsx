import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  tokenAddress?: string;
  chain?: string;
}

export function SmartImage({ src, alt, className, fallbackText, tokenAddress, chain }: SmartImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setErrorCount(0);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    const nextErrorCount = errorCount + 1;
    setErrorCount(nextErrorCount);

    if (nextErrorCount === 1 && tokenAddress && chain) {
      // Fallback 1: DexScreener Canonical
      setCurrentSrc(`https://dd.dexscreener.com/ds-data/tokens/${chain.toLowerCase()}/${tokenAddress}.png`);
    } else if (nextErrorCount === 2 && tokenAddress) {
      // Fallback 2: GeckoTerminal / CoinGecko style (best effort)
      // We don't have the Gecko ID here easily, so we try a common pattern or skip
      setErrorCount(3); // Skip to final fallback for now
    } else {
      // Final Fallback: Initials
      setCurrentSrc('');
    }
  };

  if (!currentSrc || errorCount >= 3) {
    return (
      <div className={cn("flex items-center justify-center font-black uppercase", className)}>
        {fallbackText || alt[0]}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(className, !isLoaded && "opacity-0")}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
    />
  );
}
