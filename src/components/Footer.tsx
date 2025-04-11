
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t py-8 bg-white dark:bg-connectos-800">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-connectos-500">ConnectOS</Link>
            <p className="text-sm text-muted-foreground mt-1">Dando vida digital aos objetos físicos</p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Links</p>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Como funciona</Link>
              <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explorar</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Legal</p>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidade</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Termos</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ConnectOS. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
