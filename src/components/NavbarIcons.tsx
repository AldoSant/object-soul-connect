
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { PlusCircle, LogIn } from 'lucide-react';
import NotificationsMenu from '@/components/NotificationsMenu';

const NavbarIcons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/auth')}
          className="flex items-center"
        >
          <LogIn className="mr-1 h-4 w-4" />
          <span>Entrar</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        asChild
        className="hidden md:flex"
      >
        <Link to="/story/new" className="flex items-center">
          <PlusCircle className="mr-1 h-4 w-4" />
          <span>Nova História</span>
        </Link>
      </Button>
      
      <NotificationsMenu />
      <UserMenu />
    </div>
  );
};

export default NavbarIcons;
