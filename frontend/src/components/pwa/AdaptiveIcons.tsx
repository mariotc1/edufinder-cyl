/**
 * AdaptiveIcons - Splash screens nativos para iOS
 *
 * Inyecta los link tags para apple-touch-startup-image
 * que muestran el splash screen nativo al abrir la PWA en iOS
 */
export function AdaptiveIcons() {
  return (
    <>
      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />

      {/* ================================================== */}
      {/* SPLASH SCREENS PARA iOS                            */}
      {/* ================================================== */}

      {/* iPhone 14 Pro Max */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-14-pro-max.png"
        media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 14 Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-14-pro.png"
        media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 14 Plus, 13 Pro Max, 12 Pro Max */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-12-pro-max.png"
        media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 14, 13, 13 Pro, 12, 12 Pro */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-12-pro.png"
        media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 13 mini, 12 mini, 11 Pro, XS, X */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-x.png"
        media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 11 Pro Max, XS Max */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-xs-max.png"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 11, XR */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-xr.png"
        media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPhone 8 Plus, 7 Plus, 6s Plus */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-8.png"
        media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
      />

      {/* iPhone 8, 7, 6s, 6, SE 2nd/3rd gen */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-8.png"
        media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPhone SE 1st gen */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-iphone-se.png"
        media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad Pro 12.9" */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-pro-12.png"
        media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad Pro 11" */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-pro-11.png"
        media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad Air */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-air.png"
        media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad 10th gen */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-10.png"
        media="(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad 9th gen */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-9.png"
        media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />

      {/* iPad mini 6 */}
      <link
        rel="apple-touch-startup-image"
        href="/splash/splash-ipad-mini.png"
        media="(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
      />
    </>
  );
}
