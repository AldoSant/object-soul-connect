
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import UserMenu from './UserMenu';
import { PlusCircle, Home, Search, Menu, Rss } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white dark:bg-connectos-800 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-connectos-500">ConnectOS</span>
          </Link>
          
          <div className="hidden md:flex md:gap-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Home size={16} />
              <span>Home</span>
            </Link>
            {user && (
              <Link to="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Rss size={16} />
                <span>Feed</span>
              </Link>
            )}
            <Link to="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Search size={16} />
              <span>Explore</span>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user && !isMobile && (
            <Button asChild variant="default" size="sm" className="bg-connectos-400 hover:bg-connectos-500">
              <Link to="/story/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Nova História</span>
              </Link>
            </Button>
          )}
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-4 py-4">
                  <SheetClose asChild>
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-connectos-700 rounded-md">
                      <Home size={18} />
                      <span>Home</span>
                    </Link>
                  </SheetClose>
                  {user && (
                    <SheetClose asChild>
                      <Link to="/feed" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-connectos-700 rounded-md">
                        <Rss size={18} />
                        <span>Feed</span>
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link to="/explore" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-connectos-700 rounded-md">
                      <Search size={18} />
                      <span>Explore</span>
                    </Link>
                  </SheetClose>
                  {user && (
                    <SheetClose asChild>
                      <Link to="/story/new" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-connectos-700 rounded-md">
                        <PlusCircle size={18} />
                        <span>Nova História</span>
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link to={user ? "/profile" : "/auth"} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-connectos-700 rounded-md">
                      <span>{user ? "Meu Perfil" : "Entrar / Cadastrar"}</span>
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <UserMenu />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
