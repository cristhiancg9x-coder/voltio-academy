// src/components/ui/ServerStatus.jsx
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ServerStatus() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { error } = await supabase.from('courses').select('id').limit(1);
        setStatus(error ? 'offline' : 'online');
      } catch {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors duration-500 ${
        status === 'online'
        ? 'bg-green-500/10 border-green-500/30 text-green-400'
        : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
        <Activity className={`w-3 h-3 ${status === 'online' ? 'animate-pulse' : ''}`} />
        <span>SISTEMA: {status === 'online' ? 'ONLINE (Supabase)' : status === 'loading' ? 'VERIFICANDO...' : 'OFFLINE'}</span>
    </div>
  );
}