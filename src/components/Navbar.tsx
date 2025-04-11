
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle, Home, Search } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="border-b bg-white dark:bg-connectos-800">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-connectos-500">ConnectOS</span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Home size={16} />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <Search size={16} />
              <span>Explore</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="default" size="sm" className="bg-connectos-400 hover:bg-connectos-500">
            <Link to="/object/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add Object</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
