import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'TinyLottie Optimizer';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #111827, #030712)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          top: -300,
          left: -300,
          width: 900,
          height: 900,
          background: '#00DDB3',
          opacity: 0.15,
          filter: 'blur(120px)',
          borderRadius: '50%',
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{
            background: '#00DDB3',
            padding: '24px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h1 style={{ fontSize: '84px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.02em', color: 'white' }}>
            TinyLottie
          </h1>
        </div>

        <p style={{
          fontSize: '52px',
          color: '#e5e7eb',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: '900px',
          fontWeight: 600,
        }}>
          Make Your Lotties <span style={{ color: '#00DDB3' }}>Lighter Than Air</span>
        </p>
        
        <div style={{
          display: 'flex',
          gap: '40px',
          marginTop: '60px',
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00DDB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
             </svg>
             <span style={{ fontSize: '32px', color: '#9ca3af', fontWeight: 500 }}>Up to 98% Smaller</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00DDB3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
             </svg>
             <span style={{ fontSize: '32px', color: '#9ca3af', fontWeight: 500 }}>100% Private</span>
           </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
