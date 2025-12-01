// src/components/ui/ServerStatus.jsx
import { useState, useEffect } from 'react';
import { Activity, Server } from 'lucide-react';

export default function ServerStatus() {
  const [status, setStatus] = useState('offline'); // 'loading', 'online', 'offline'
  const [info, setInfo] = useState(null);

  // LÓGICA INTELIGENTE:
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const checkServer = async () => {
      try {
        // Consultamos al backend dinámicamente
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        
        if (data.estado === 'OK') {
          setStatus('online');
          setInfo(data.version);
        }
      } catch (error) {
        setStatus('offline');
        // No mostramos console.error para no ensuciar la consola del navegador si está offline
      }
    };

    checkServer();
    
    // Revisar cada 10 segundos si sigue vivo
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors duration-500 ${
        status === 'online' 
        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
        : 'bg-red-500/10 border-red-500/30 text-red-400'
    }`}>
        {status === 'online' ? (
            <>
                <Activity className="w-3 h-3 animate-pulse" />
                <span>SISTEMA: ONLINE (v{info})</span>
            </>
        ) : (
            <>
                <Server className="w-3 h-3" />
                <span>SISTEMA: OFFLINE</span>
            </>
        )}
    </div>
  );
}