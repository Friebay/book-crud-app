// pages/_app.tsx or pages/_app.js
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import '../styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;