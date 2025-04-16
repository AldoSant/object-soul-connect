
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import CallToAction from '@/components/home/CallToAction';
import SeedDatabase from '@/components/SeedDatabase';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <CallToAction />
        
        <div className="container py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Teste o sistema com exemplos pré-configurados
          </p>
          <div className="flex justify-center">
            <SeedDatabase />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
