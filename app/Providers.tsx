'use client'; 

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react'; // ⬅️ Adicionado para tipagem

const BASE_PATH = '/tasks'; 

// Adicionado React.PropsWithChildren para corrigir o erro de tipagem no children
export default function Providers({ children }: React.PropsWithChildren<{}>) { 
  const router = useRouter(); 
  const pathname = usePathname(); 

  useEffect(() => {
    // Ação: Se o usuário acessar a raiz do site, force o redirecionamento
    if (pathname === '/') {
        // Redireciona para o basePath. Usamos router.replace para evitar loop no history.
        router.replace(BASE_PATH);
    }
    // NOTA: Os links internos devem funcionar agora que este componente está ativo.
  }, [pathname, router]); 

  return (
    <>
      {children}
    </>
  );
}