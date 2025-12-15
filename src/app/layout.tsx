// 1. Direct Carbon CSS Import
import '@carbon/styles/css/styles.css'; 

import { Inter } from 'next/font/google';
import StytchProviderWrapper from './StytchProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TuboVideo',
  description: 'A streaming platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. SINGLE Body tag with the class applied directly */}
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <StytchProviderWrapper>
          {children}
        </StytchProviderWrapper>
      </body>
    </html>
  );
}