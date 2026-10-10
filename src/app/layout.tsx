import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SiteHeader, SiteFooter } from "@/components/site";

export const metadata: Metadata = {
  title: "Mister Auto — pièces auto et accessoires",
  description: "Trouvez les pièces auto compatibles avec votre véhicule au meilleur prix.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <StoreProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
