import React, { useState } from 'react';

export const CREA_EF_LOGO_URL = 'https://lh3.googleusercontent.com/d/10xARAH1teV4NN9a3E7C2wQ44eFtB02QU=s220';
export const CREA_EF_LOGO_ALT_URL = 'https://lh3.googleusercontent.com/d/10xARAH1teV4NN9a3E7C2wQ44eFtB02QU=w800';

interface CreaEfLogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const CreaEfLogo: React.FC<CreaEfLogoProps> = ({ className = 'w-10 h-10', size, alt = 'Crea-Ef Logo' }) => {
  const [imgSrc, setImgSrc] = useState<string>(CREA_EF_LOGO_URL);
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    if (imgSrc === CREA_EF_LOGO_URL) {
      setImgSrc(CREA_EF_LOGO_ALT_URL);
    } else {
      setImgError(true);
    }
  };

  if (!imgError) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={handleError}
        className={`${className} object-contain rounded-2xl shrink-0`}
        style={size ? { width: size, height: size } : undefined}
      />
    );
  }

  // High quality vector SVG fallback
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="5" y="5" width="290" height="290" rx="40" fill="#FFFFFF" />
      <rect x="138" y="24" width="24" height="20" rx="4" fill="#0A2240" />
      <rect x="134" y="20" width="32" height="6" rx="2" fill="#E85D04" />
      <path d="M 82 48 L 96 60" stroke="#0A2240" strokeWidth="10" strokeLinecap="round" />
      <path d="M 218 48 L 204 60" stroke="#0A2240" strokeWidth="10" strokeLinecap="round" />
      <circle cx="150" cy="160" r="108" stroke="#0A2240" strokeWidth="14" fill="none" />
      <circle cx="150" cy="160" r="98" stroke="#007A33" strokeWidth="6" strokeDasharray="160 360" fill="none" />
      <circle cx="150" cy="160" r="98" stroke="#FFFFFF" strokeWidth="6" strokeDasharray="80 360" strokeDashoffset="-160" fill="none" />
      <circle cx="150" cy="160" r="90" stroke="#E85D04" strokeWidth="9" fill="none" />
      <circle cx="150" cy="160" r="84" fill="#FFFFFF" />
      <line x1="150" y1="80" x2="150" y2="88" stroke="#0A2240" strokeWidth="3" strokeLinecap="round" />
      <line x1="150" y1="232" x2="150" y2="240" stroke="#0A2240" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="160" x2="78" y2="160" stroke="#0A2240" strokeWidth="3" strokeLinecap="round" />
      <line x1="222" y1="160" x2="230" y2="160" stroke="#0A2240" strokeWidth="3" strokeLinecap="round" />
      <g fill="#007A33">
        <path d="M 112 108 Q 104 102 96 110 Q 106 116 112 108 Z" />
        <path d="M 104 120 Q 94 118 90 128 Q 100 131 104 120 Z" />
        <path d="M 102 134 Q 92 136 90 146 Q 100 145 102 134 Z" />
      </g>
      <g fill="#007A33">
        <path d="M 188 208 Q 196 214 204 206 Q 194 200 188 208 Z" />
        <path d="M 196 194 Q 206 196 210 186 Q 199 183 196 194 Z" />
        <path d="M 198 178 Q 208 176 210 166 Q 200 166 198 178 Z" />
      </g>
      <g transform="translate(48, 128) rotate(-16)">
        <path d="M 0 12 Q 18 2 36 12 L 36 50 Q 18 40 0 50 Z" fill="#E85D04" stroke="#0A2240" strokeWidth="3" />
        <path d="M 36 12 Q 54 2 72 12 L 72 50 Q 54 40 36 50 Z" fill="#E85D04" stroke="#0A2240" strokeWidth="3" />
        <path d="M 4 14 Q 18 6 33 14 L 33 46 Q 18 38 4 46 Z" fill="#FFFFFF" stroke="#0A2240" strokeWidth="2" />
        <path d="M 39 14 Q 54 6 68 14 L 68 46 Q 54 38 39 46 Z" fill="#FFFFFF" stroke="#0A2240" strokeWidth="2" />
        <line x1="10" y1="23" x2="27" y2="23" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="10" y1="30" x2="25" y2="30" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="10" y1="37" x2="28" y2="37" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="23" x2="62" y2="23" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="30" x2="60" y2="30" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="37" x2="63" y2="37" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <circle cx="165" cy="110" r="12" fill="#E85D04" stroke="#0A2240" strokeWidth="3" />
      <path d="M 160 122 Q 138 138 102 144 Q 140 152 162 168 L 152 196" fill="#E85D04" stroke="#0A2240" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M 156 127 Q 130 144 110 148 Q 138 155 154 165" fill="#FFFFFF" stroke="#0A2240" strokeWidth="2" />
      <path d="M 152 180 L 176 184 L 168 204 L 146 196 Z" fill="#0A2240" stroke="#0A2240" strokeWidth="2" />
      <path d="M 168 198 L 194 220 L 180 250" stroke="#E85D04" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 168 198 L 194 220 L 180 250" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="176" cy="252" rx="10" ry="5" fill="#0284C7" stroke="#0A2240" strokeWidth="2.5" />
      <path d="M 148 192 L 126 208 L 115 232" stroke="#E85D04" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 148 192 L 126 208 L 115 232" stroke="#0A2240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="110" cy="234" rx="9" ry="5" fill="#0284C7" stroke="#0A2240" strokeWidth="2.5" />
      <path d="M 155 128 L 132 142 L 118 132" stroke="#0A2240" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 168 128 L 194 118 L 208 98" stroke="#0A2240" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="204" y="74" width="10" height="26" rx="2" fill="#0A2240" stroke="#0A2240" strokeWidth="2" />
      <path d="M 200 74 L 218 74 L 214 66 L 204 66 Z" fill="#E85D04" stroke="#0A2240" strokeWidth="2" />
      <path d="M 209 66 Q 192 42 209 25 Q 226 44 209 66 Z" fill="#E85D04" stroke="#0A2240" strokeWidth="2.5" />
      <path d="M 209 58 Q 198 42 209 32 Q 220 44 209 58 Z" fill="#F59E0B" />
      <polygon points="209,14 232,22 209,30 186,22" fill="#0284C7" stroke="#0A2240" strokeWidth="2.5" />
      <rect x="201" y="26" width="16" height="7" fill="#0A2240" />
      <path d="M 228 22 L 235 32 L 235 40" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};
