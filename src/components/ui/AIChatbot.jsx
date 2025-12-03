import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy VoltioBot ⚡. Tu asistente experto en el Código Nacional de Electricidad (CNE). ¿En qué te ayudo?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Leemos la clave del archivo .env
  const API_KEY = import.meta.env.PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    
    const userMessage = inputText;
    setInputText('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Actúa como VoltioBot, un ingeniero eléctrico senior experto en normativa peruana (CNE). 
                       Responde a la siguiente consulta de forma técnica, segura y breve: "${userMessage}"`
              }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error API Google:", data);
        throw new Error(data.error?.message || "Error desconocido en la API");
      }

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
      } else {
        throw new Error("Gemini no devolvió texto.");
      }

    } catch (error) {
      console.error("Fallo en el Chatbot:", error);
      let errorMsg = "Tuve un cortocircuito interno 💥.";
      
      if (error.message.includes("API key")) errorMsg = "Error: Mi llave de acceso (API Key) no es válida.";
      if (error.message.includes("404")) errorMsg = "Error: No encuentro el modelo de IA.";
      
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-volt-primary to-volt-secondary rounded-full shadow-[0_0_20px_rgba(0,240,255,0.6)] z-50 transition-shadow group"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Sparkles className="w-6 h-6 text-black fill-current" />
      </motion.button>

      {/* VENTANA DEL CHAT (ARREGLO MÓVIL APLICADO) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            /* CAMBIOS RESPONSIVOS AQUI:
               1. w-[90%] -> En celular ocupa el 90% del ancho (no se sale).
               2. md:w-96 -> En PC vuelve a su tamaño fijo.
               3. right-0 left-0 mx-auto -> Centrado perfecto en celular.
               4. md:right-6 md:left-auto -> En PC se va a la esquina.
               5. bottom-24 -> Un poco más arriba para no chocar con el teclado.
               6. max-h-[60vh] -> Para que no sea muy alto si sale el teclado.
            */
            className="fixed bottom-24 right-0 left-0 mx-auto w-[90%] md:w-96 md:right-6 md:left-auto h-[60vh] md:h-[500px] bg-volt-dark/95 backdrop-blur-xl border border-volt-primary/30 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-volt-primary/10 to-transparent border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-volt-primary/20 rounded-full border border-volt-primary/30">
                        <Zap className="w-5 h-5 text-volt-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white font-display text-lg">VoltioBot AI</h3>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-slate-400">En línea</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400 hover:text-white" />
                </button>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-volt-primary/20 scrollbar-track-transparent">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-volt-primary text-volt-dark font-medium rounded-tr-none shadow-lg' 
                            : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin text-volt-primary" /> 
                            <span>Analizando normativa...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe tu consulta..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-volt-primary focus:ring-1 focus:ring-volt-primary outline-none transition-all placeholder:text-slate-600"
                />
                <button 
                    onClick={handleSend} 
                    disabled={loading || !inputText.trim()}
                    className="p-3 bg-volt-primary text-volt-dark rounded-xl hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}