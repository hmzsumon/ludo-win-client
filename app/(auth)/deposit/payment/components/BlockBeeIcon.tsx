export default function BlockBeeIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="20" fill="#1A1A2E" />
      <text x="50" y="65" textAnchor="middle" fontSize="40">
        🐝
      </text>
    </svg>
  );
}
