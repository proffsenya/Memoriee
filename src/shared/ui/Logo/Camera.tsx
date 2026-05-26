export const CameraLogo = ({ size = 64 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {/* Camera body */}
    <rect x="20" y="30" width="160" height="110" rx="12" stroke="currentColor" strokeWidth="2.5" />

    {/* Camera lens */}
    <circle cx="100" cy="85" r="35" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="100" cy="85" r="28" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="100" cy="85" r="21" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="100" cy="85" r="8" fill="currentColor" />

    {/* Flash */}
    <rect x="130" y="35" width="28" height="16" rx="3" stroke="currentColor" strokeWidth="2" />

    {/* Shutter button */}
    <circle cx="145" cy="50" r="6" fill="currentColor" />
  </svg>
);
