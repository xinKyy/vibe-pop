interface LogoProps {
  size?: number;
  className?: string;
  /** 是否显示黄色发光效果（大尺寸建议开启） */
  glow?: boolean;
}

/**
 * VibePop 品牌 Logo：深蓝-紫圆角方形底 + 黄色闪电。
 * 内联 SVG 便于随意缩放、无网络请求，与 public/favicon.svg 保持一致。
 */
export default function Logo({ size = 48, className, glow = true }: LogoProps) {
  const glowId = glow ? `logo-glow-${size}` : undefined;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-label="VibePop"
    >
      <defs>
        <linearGradient id={`logo-bg-${size}`} x1="20%" y1="20%" x2="80%" y2="80%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#1E2937" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`logo-bolt-${size}`} x1="30%" y1="20%" x2="70%" y2="80%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {glowId && (
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FACC15" floodOpacity="0.4" />
          </filter>
        )}
      </defs>
      <rect x="12" y="12" width="176" height="176" rx="42" ry="42" fill={`url(#logo-bg-${size})`} />
      <g filter={glowId ? `url(#${glowId})` : undefined}>
        <polygon
          points="92,55 115,55 85,98 108,98 78,145 102,145 125,88 102,88"
          fill={`url(#logo-bolt-${size})`}
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </g>
      <polygon
        points="95,60 112,60 87,95 105,95 82,135 99,135 120,88 105,88"
        fill="#ffffff"
        opacity="0.25"
      />
    </svg>
  );
}
