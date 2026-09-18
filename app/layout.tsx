import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Exercices C · MPI",
  description: "Exercices progressifs de programmation C pour MPI. Écrivez, exécutez et vérifiez votre code dans le navigateur.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
