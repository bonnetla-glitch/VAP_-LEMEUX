import { useParams, useNavigate } from 'react-router-dom';

export default function ConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande envoyée !</h1>
        <p className="text-gray-500 mb-1">Votre commande a bien été reçue.</p>
        <p className="text-gray-500 mb-6">
          Elle sera traitée dès que possible par notre équipe.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 mb-6">
          <p className="text-sm text-blue-600 font-medium">Numéro de commande</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">#{String(id).padStart(4, '0')}</p>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Conservez ce numéro pour suivre votre commande.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary w-full py-3">
          Retour au catalogue
        </button>
      </div>
    </div>
  );
}
