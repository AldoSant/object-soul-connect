
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in, if so redirect to home page
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-connectos-700">Acesse sua conta</h1>
            <p className="text-gray-600 mt-2">
              Faça login ou crie uma conta para registrar histórias digitais e contribuir com o ConnectOS.
            </p>
          </div>
          
          <div className="flex justify-center">
            <AuthForm />
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-xl font-medium text-connectos-600 mb-3">Por que criar uma conta?</h2>
            <p className="text-gray-600 mb-6">
              Ao criar uma conta no ConnectOS, você poderá:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Registrar histórias digitais</h3>
                <p className="text-sm text-gray-500">
                  Registre a memória digital de objetos, pessoas, espaços e eventos.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Gerenciar sua coleção</h3>
                <p className="text-sm text-gray-500">
                  Edite, atualize e organize todas as suas histórias digitais.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Compartilhar histórias</h3>
                <p className="text-sm text-gray-500">
                  Compartilhe com amigos ou torne suas histórias públicas para todos.
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium mb-2">Conectar objetos físicos</h3>
                <p className="text-sm text-gray-500">
                  Use tags NFC e QR codes para acessar histórias digitais no mundo físico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
