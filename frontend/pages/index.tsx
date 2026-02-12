import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-red-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Juego de Vértices
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/local')}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Juego Local
          </button>
          
          <button
            onClick={() => router.push('/online')}
            className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Juego Online
          </button>
          
          <button
            onClick={() => router.push('/ai')}
            className="w-full py-3 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Jugar vs IA
          </button>
        </div>
      </div>
    </div>
  );
}
