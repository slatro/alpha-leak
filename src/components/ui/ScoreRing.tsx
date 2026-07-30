import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ScoreRing({ score, size = 60, strokeWidth = 4, color }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = 'text-cyber-success';
  if (score < 40) colorClass = 'text-cyber-danger';
  else if (score < 70) colorClass = 'text-cyber-warning';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        className="absolute top-0 left-0 transform -rotate-90 overflow-visible" 
        width={size} 
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Background circle */}
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `url(#glow-${score})` }}
        />
      </svg>
      <div className={`absolute text-sm font-black italic tracking-tighter ${colorClass}`}>
        {score}
      </div>
    </div>
  );
}
