'use client'; 

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Providers({ children }) {
  const router = useRouter(); 
  const pathname = usePathname(); 

  // Este useEffect é mantido para que você possa, se necessário,
  // adicionar lógica global de autenticação ou inicialização de contexto
  // no futuro. Por enquanto, ele apenas estabiliza o roteador.
  useEffect(() => {
    // Ação: Não faça NADA aqui que manipule o pathname ou router.replace.
    // O Next.js deve lidar com isso automaticamente.
    console.log("Providers carregado. Path atual:", pathname);
  }, [pathname]); // Mantemos a dependência no pathname para estabilizar o hook

  return (
    <>
      {children}
    </>
  );
}