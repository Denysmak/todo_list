import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './Providers'; // ⬅️ IMPORTAÇÃO OBRIGATÓRIA

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gerenciador de Tarefas',
  description: 'Organize suas tarefas de forma simples e eficiente',
};

export default function RootLayout({
  children,
}: {
  // Tipagem explícita para o TypeScript, corrigindo o aviso anterior.
  children: React.ReactNode; 
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* O Providers envolve a aplicação para forçar a detecção do basePath */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}