// ANCHOR: PWA-DOCUMENT-SETUP — START
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Icons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
          <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />

          {/* Manifest + Theme */}
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#0b2149" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
// ANCHOR: PWA-DOCUMENT-SETUP — END
