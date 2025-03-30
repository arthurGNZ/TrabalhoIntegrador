'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Efeito que será executado apenas uma vez no carregamento inicial do cliente
  useEffect(() => {
    setMounted(true);
    
    // Forçar o body a ser visível imediatamente
    document.body.style.opacity = '1';
  }, []);

  // Efeito para gerenciar as classes do body baseado na rota
  useEffect(() => {
    if (!mounted) return;
    
    // Reset de classes de animação ao mudar de rota
    document.body.classList.remove('unloading');
    
    // Importante: Configurar o scroll de acordo com a página
    if (pathname === '/login') {
      // Na página de login, desabilita o scroll
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
    } else {
      // Em outras páginas, habilita o scroll
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = '';
    }
    
    // Adiciona a classe 'loaded' para animação de fade-in
    document.body.classList.add('loaded');
    
    return () => {
      // Limpeza ao desmontar ou mudar de rota
      document.body.classList.remove('loaded');
    };
  }, [pathname, mounted]);

  // Renderizar o conteúdo imediatamente, sem esperar por animações
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}