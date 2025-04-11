
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  // Demo toast to show how the app works
  const showDemoToast = () => {
    toast({
      title: "Bem-vindo ao ConnectOS!",
      description: "Esta é uma demonstração do projeto ConnectOS. Explore e conheça as funcionalidades!",
    });
  };

  React.useEffect(() => {
    const hasShownWelcome = localStorage.getItem("connectos-welcome-shown");
    if (!hasShownWelcome) {
      setTimeout(() => {
        showDemoToast();
        localStorage.setItem("connectos-welcome-shown", "true");
      }, 1500);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
