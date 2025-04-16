
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/home')) return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex items-center justify-around z-50">
      <Link
        to="/"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
          isActive('/') 
            ? "text-connectos-500 bg-connectos-50 dark:bg-connectos-900/20" 
            : "text-gray-500 hover:text-connectos-500 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
        aria-label="Página inicial"
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link
        to="/feed"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
          isActive('/feed')
            ? "text-connectos-500 bg-connectos-50 dark:bg-connectos-900/20"
            : "text-gray-500 hover:text-connectos-500 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
        aria-label="Feed"
      >
        <Users size={24} />
        <span className="text-xs mt-1">Feed</span>
      </Link>
      
      <Link
        to="/explore"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
          isActive('/explore')
            ? "text-connectos-500 bg-connectos-50 dark:bg-connectos-900/20"
            : "text-gray-500 hover:text-connectos-500 hover:bg-gray-50 dark:hover:bg-gray-800"
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
          <div className="bg-connectos-500 text-white p-3 rounded-full -mt-5 shadow-lg hover:bg-connectos-600 transition-colors">
            <PlusCircle size={24} />
          </div>
          <span className="text-xs mt-1">Criar</span>
        </Link>
      )}
      
      <Link
        to={user ? "/profile" : "/auth"}
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors",
          isActive('/profile') || isActive('/auth')
            ? "text-connectos-500 bg-connectos-50 dark:bg-connectos-900/20"
            : "text-gray-500 hover:text-connectos-500 hover:bg-gray-50 dark:hover:bg-gray-800"
        )}
        aria-label={user ? "Perfil do usuário" : "Entrar ou cadastrar"}
      >
        <User size={24} />
        <span className="text-xs mt-1">{user ? "Perfil" : "Entrar"}</span>
      </Link>
    </nav>
  );
};

export default MobileNav;
