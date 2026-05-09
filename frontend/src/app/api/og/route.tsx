import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parámetros
  const type = searchParams.get('type') || 'default';
  const title = searchParams.get('title') || 'EduFinder CyL';
  const centros = searchParams.get('centros')?.split('|').filter(Boolean) || [];
  const subtitle = searchParams.get('subtitle') || '';

  // Imagen para comparador
  if (type === 'comparador' && centros.length > 0) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header gradient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 50px',
              background: 'linear-gradient(135deg, #223945 0%, #1e40af 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                  <path d="M12 12L20 7.5" />
                  <path d="M12 12V21" />
                  <path d="M12 12L4 7.5" />
                </svg>
              </div>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>
                EduFinder CyL
              </span>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '12px 24px',
                borderRadius: '50px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Comparador de Centros
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '50px',
              gap: '24px',
            }}
          >
            <div style={{ fontSize: '24px', color: '#64748b', fontWeight: 500 }}>
              Comparando {centros.length} centros educativos:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {centros.slice(0, 3).map((centro, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    background: 'white',
                    padding: '24px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #223945 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 600,
                      color: '#1e293b',
                      flex: 1,
                    }}
                  >
                    {centro.length > 45 ? centro.substring(0, 45) + '...' : centro}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px 50px',
              borderTop: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '18px' }}>
              edufinder.es
            </span>
            <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>
              Encuentra tu centro educativo ideal en Castilla y León
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // Imagen para centro específico
  if (type === 'centro' && title) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header gradient */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '40px 50px',
              background: 'linear-gradient(135deg, #223945 0%, #1e40af 100%)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
                <path d="M12 12L20 7.5" />
                <path d="M12 12V21" />
                <path d="M12 12L4 7.5" />
              </svg>
            </div>
            <span style={{ color: 'white', fontSize: '28px', fontWeight: 700 }}>
              EduFinder CyL
            </span>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '50px 60px',
              gap: '24px',
            }}
          >
            <div
              style={{
                fontSize: '52px',
                fontWeight: 800,
                color: '#1e293b',
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '28px', color: '#64748b', fontWeight: 500 }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '30px 50px',
              borderTop: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <span style={{ color: '#94a3b8', fontSize: '18px' }}>
              edufinder.es
            </span>
            <span style={{ color: '#64748b', fontSize: '18px', fontWeight: 500 }}>
              Encuentra tu centro educativo ideal en Castilla y León
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // Imagen por defecto
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #223945 0%, #1e40af 50%, #3b82f6 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '32px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" />
            <path d="M12 12L20 7.5" />
            <path d="M12 12V21" />
            <path d="M12 12L4 7.5" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          {subtitle || 'Encuentra tu centro educativo ideal en Castilla y León'}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          edufinder.es
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
