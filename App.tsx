
import React, { useState, useRef } from 'react';
import { Layout } from './components/Layout';
import { ImageState } from './types';
import { redecorateRoom } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    modified: null,
    loading: false,
    error: null,
  });
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState({
          original: event.target?.result as string,
          modified: null,
          loading: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRedecorate = async () => {
    if (!state.original || !prompt) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await redecorateRoom(state.original, prompt);
      setState(prev => ({
        ...prev,
        modified: result,
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Ocurrió un error inesperado.",
      }));
    }
  };

  const clearApp = () => {
    setState({
      original: null,
      modified: null,
      loading: false,
      error: null,
    });
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = () => {
    if (!state.modified) return;
    const link = document.createElement('a');
    link.href = state.modified;
    link.download = 'habitacion-redecorada.png';
    link.click();
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Rediseña tu habitación en segundos
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Sube una foto de cualquier habitación y dinos cómo quieres que se vea.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Columna Izquierda: Controles */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">1. Sube tu foto</h3>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${state.original ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                {!state.original ? (
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Haz clic para subir o arrastra una imagen</p>
                  </div>
                ) : (
                  <div className="relative group">
                    <img src={state.original} alt="Original" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-white text-sm font-medium">Cambiar imagen</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">2. Define el estilo</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Conviértela en una habitación estilo nórdico, con paredes gris claro, muebles de madera natural y muchas plantas."
                className="w-full h-32 p-4 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none outline-none"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {['Minimalista', 'Boho Chic', 'Industrial', 'Moderno'].map(style => (
                  <button 
                    key={style}
                    onClick={() => setPrompt(`Redecora esta habitación en estilo ${style.toLowerCase()}.`)}
                    className="px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    + {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRedecorate}
              disabled={state.loading || !state.original || !prompt}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2 ${
                state.loading || !state.original || !prompt
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {state.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>¡Redecorar Ahora!</span>
                </>
              )}
            </button>

            {state.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <p className="font-bold mb-1">Error:</p>
                <p>{state.error}</p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Área de Visualización */}
          <div className="lg:col-span-2">
            <div className="bg-white h-full min-h-[500px] rounded-3xl shadow-xl border border-gray-100 p-4 relative overflow-hidden flex flex-col items-center justify-center">
              {!state.modified && !state.loading && !state.original && (
                <div className="text-center text-gray-400 max-w-sm">
                  <div className="bg-gray-50 p-8 rounded-full inline-block mb-4">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">El resultado aparecerá aquí</p>
                  <p className="text-sm mt-2">Sube una foto y aplica un estilo para comenzar tu transformación.</p>
                </div>
              )}

              {state.loading && (
                <div className="text-center z-10 p-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Inspirando cambios...</h4>
                  <p className="text-gray-500 max-w-xs mx-auto">Nuestra IA está analizando tu espacio para crear un diseño espectacular basado en tus instrucciones.</p>
                </div>
              )}

              {state.modified && !state.loading && (
                <div className="w-full h-full flex flex-col space-y-4">
                  <div className="flex-grow relative rounded-2xl overflow-hidden shadow-2xl group">
                    <img src={state.modified} alt="Resultado" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black bg-opacity-30 backdrop-blur-md p-3 rounded-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="text-white text-xs font-medium">
                        <p className="opacity-70">Instrucción utilizada:</p>
                        <p className="truncate max-w-[200px]">{prompt}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={downloadImage}
                          className="bg-white text-gray-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Descargar imagen"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center px-2">
                    <button 
                      onClick={clearApp}
                      className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Limpiar todo
                    </button>
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => {
                          const win = window.open('', '_blank');
                          win?.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;"><img src="${state.modified}" style="max-width:100%;max-height:100%;"></body></html>`);
                        }}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Ver en pantalla completa
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {state.original && !state.modified && !state.loading && (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                   <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                      <img src={state.original} alt="Vista Previa Original" className="w-full h-full object-cover" />
                   </div>
                   <div className="text-center">
                     <p className="text-gray-500 font-medium italic">"{prompt || 'Escribe una instrucción para ver la magia...'}"</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Características / Beneficios */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-16">
          <div className="text-center">
            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h5 className="font-bold text-gray-900 mb-2">Resultados en Segundos</h5>
            <p className="text-sm text-gray-600">Olvídate de esperar días por un diseñador. Obtén ideas frescas al instante.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h5 className="font-bold text-gray-900 mb-2">Fotorrealismo IA</h5>
            <p className="text-sm text-gray-600">Utilizamos el potente modelo Gemini 2.5 Flash Image para creaciones que parecen reales.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h5 className="font-bold text-gray-900 mb-2">Personalización Total</h5>
            <p className="text-sm text-gray-600">Desde el color de las paredes hasta el tipo de suelo, tú tienes el control total del estilo.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;
