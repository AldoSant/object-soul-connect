
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import UserMenu from '@/components/UserMenu';
import NotificationsMenu from '@/components/NotificationsMenu';
import { Search, Home, Compass, PlusCircle, BookOpen } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

const NavbarIcons = () => {
  const { user } = useAuth();
  const { openSearch } = useSearch();
  
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button asChild variant="default" size="sm" className="bg-connectos-400 hover:bg-connectos-500">
          <Link to="/auth">Entrar</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Button variant="ghost" size="icon" onClick={openSearch} className="hidden sm:flex">
        <Search className="h-5 w-5" />
      </Button>
      
      <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
        <Link to="/home">
          <Home className="h-5 w-5" />
        </Link>
      </Button>
      
      <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
        <Link to="/explore">
          <Compass className="h-5 w-5" />
        </Link>
      </Button>
      
      <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
        <Link to="/feed">
          <BookOpen className="h-5 w-5" />
        </Link>
      </Button>
      
      <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
        <Link to="/story/new">
          <PlusCircle className="h-5 w-5" />
        </Link>
      </Button>
      
      <NotificationsMenu />
      <UserMenu />
    </div>
  );
};

export default NavbarIcons;
