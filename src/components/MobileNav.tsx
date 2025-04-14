
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-connectos-800 border-t px-2 py-2 flex items-center justify-around z-50">
      <Link
        to="/"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1",
          isActive('/') ? "text-primary font-medium" : "text-gray-500"
        )}
        aria-label="Página inicial"
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link
        to="/feed"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1",
          isActive('/feed') ? "text-primary font-medium" : "text-gray-500"
        )}
        aria-label="Feed"
      >
        <Users size={24} />
        <span className="text-xs mt-1">Feed</span>
      </Link>
      
      <Link
        to="/explore"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1",
          isActive('/explore') ? "text-primary font-medium" : "text-gray-500"
        )}
        aria-label="Explorar histórias"
      >
        <Search size={24} />
        <span className="text-xs mt-1">Explorar</span>
      </Link>
      
      {user && (
        <Link
          to="/story/new"
          className="flex flex-col items-center justify-center px-2 py-1"
          aria-label="Criar nova história"
        >
          <div className="bg-primary text-primary-foreground p-3 rounded-full -mt-5 shadow-md">
            <PlusCircle size={24} />
          </div>
          <span className="text-xs mt-1">Criar</span>
        </Link>
      )}
      
      {user ? (
        <Link
          to="/profile"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1",
            isActive('/profile') ? "text-primary font-medium" : "text-gray-500"
          )}
          aria-label="Perfil do usuário"
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      ) : (
        <Link
          to="/auth"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1",
            isActive('/auth') ? "text-primary font-medium" : "text-gray-500"
          )}
          aria-label="Entrar ou cadastrar"
        >
          <User size={24} />
          <span className="text-xs mt-1">Entrar</span>
        </Link>
      )}
    </nav>
  );
};

export default MobileNav;
