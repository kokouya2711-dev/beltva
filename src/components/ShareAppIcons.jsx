import React from "react";

// Official brand logo SVGs for share targets.
// Each icon is rendered inside a rounded square container (like the reference photo).

export function LineIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-[#06C755] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 100" width={size * 0.68} height={size * 0.68} xmlns="http://www.w3.org/2000/svg">
        <path d="M50 8C26 8 6 25 6 45c0 18 16 33 38 36 2 3 3 7 3 7s2-5 2-8c22-3 39-18 39-38 0-20-20-34-38-34z" fill="white"/>
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#06C755" fontSize="14" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="-0.5">LINE</text>
      </svg>
    </div>
  );
}

export function XIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    </div>
  );
}

export function FacebookIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-[#1877F2] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" width={size * 0.5} height={size * 0.5} fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </div>
  );
}

export function WhatsAppIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-[#25D366] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </div>
  );
}

export function TelegramIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-[#0088CC] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.092.036.276.02.428-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    </div>
  );
}

export function OthersIcon({ size = 48 }) {
  return (
    <div style={{ width: size, height: size }} className="rounded-[14px] bg-secondary border border-border flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" className="text-foreground">
        <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  );
}