
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User, Menu } from 'lucide-react';
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
    <nav className="mobile-nav">
      <Link
        to="/"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1",
          isActive('/') ? "text-connectos-500" : "text-gray-500"
        )}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link
        to="/explore"
        className={cn(
          "flex flex-col items-center justify-center px-2 py-1",
          isActive('/explore') ? "text-connectos-500" : "text-gray-500"
        )}
      >
        <Search size={24} />
        <span className="text-xs mt-1">Explorar</span>
      </Link>
      
      {user && (
        <Link
          to="/story/new"
          className="flex flex-col items-center justify-center px-2 py-1"
        >
          <div className="bg-connectos-500 text-white p-3 rounded-full -mt-5">
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
            isActive('/profile') ? "text-connectos-500" : "text-gray-500"
          )}
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>
      ) : (
        <Link
          to="/auth"
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1",
            isActive('/auth') ? "text-connectos-500" : "text-gray-500"
          )}
        >
          <User size={24} />
          <span className="text-xs mt-1">Entrar</span>
        </Link>
      )}
    </nav>
  );
};

export default MobileNav;
