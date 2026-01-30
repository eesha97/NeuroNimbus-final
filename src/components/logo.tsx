import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140"
      height="40"
      aria-label="NeuroNimbus Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M 25,40 A 20,20 0,0,1 25,10 H 30 A 15,15 0,0,1 45,25 A 15,15 0,0,1 30,40 Z"
        fill="url(#logo-gradient)"
        transform="translate(5, -5)"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="5 -5; 5 0; 5 -5"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>
      <text
        x="55"
        y="29"
        fontFamily="Belleza, sans-serif"
        fontSize="24"
        fill="hsl(var(--foreground))"
        className="font-headline"
      >
        NeuroNimbus
      </text>
    </svg>
  );
}
