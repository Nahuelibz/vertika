import { useRouter } from 'next/router';

export default function AIGame() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Jugar vs IA</h1>
        
        <div className="space-y-4">
          <button 
            onClick={() => router.push('/ai/easy')}
            className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Fácil
          </button>
          
          <button 
            onClick={() => router.push('/ai/medium')}
            className="w-full py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Medio
          </button>
          
          <button 
            onClick={() => router.push('/ai/hard')}
            className="w-full py-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Difícil
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
