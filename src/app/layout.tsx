import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HybridAuthProvider } from "../contexts/HybridAuthContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import SessionTimeoutWarning from "../components/SessionTimeoutWarning";
import { AccessibilityProvider } from "../contexts/AccessibilityContext";
import AccessibilityPanel from "../components/AccessibilityPanel";
import { ToastProvider } from "../components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dead Horse Gallery",
  description: "Curated Web3 Art Gallery - Still flogging it.",
  keywords: "art, gallery, web3, nft, digital art, blockchain",
  authors: [{ name: "Dead Horse Gallery" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
          <AccessibilityProvider>
            <HybridAuthProvider>
              {/* Skip to main content link for screen readers */}
              <a 
                href="#main-content" 
                className="skip-link"
                onClick={(e) => {
                  e.preventDefault();
                  const main = document.getElementById('main-content');
                  if (main) {
                    main.focus();
                    main.scrollIntoView();
                  }
                }}
              >
                Skip to main content
              </a>
              
              {/* Main content with proper landmark */}
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              
              {/* Session timeout warning */}
              <SessionTimeoutWarning compact />
              
              {/* Accessibility panel */}
              <AccessibilityPanel />
            </HybridAuthProvider>
          </AccessibilityProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}