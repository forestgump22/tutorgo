// src/app/(platform)/tutores/[tutorId]/page.tsx

import { getTutorProfileById } from "@/services/tutor.service"; // Ahora esta importación funcionará
import { TutorProfile } from "@/models/tutor.models";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { ReservaTutoria } from './ReservaTutoria'; 

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < fullStars; i++) stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStarSolid} className="text-yellow-400" />);
  const emptyStars = 5 - fullStars;
  for (let i = 0; i < emptyStars; i++) stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStarRegular} className="text-gray-300" />);
  return stars;
};

// Este es un Server Component, ideal para cargar los datos del perfil.
export default async function TutorProfilePage({ params }: { params: { tutorId: string } }) {
  const tutorId = Number(params.tutorId);

  // Validar que tutorId es un número válido
  if (isNaN(tutorId)) {
    return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600">ID de Tutor Inválido</h1>
            <p className="text-gray-600 mt-2">El ID proporcionado no es un número.</p>
        </div>
    );
  }

  let tutor: TutorProfile | null = null;
  let error: string | null = null;

  try {
    tutor = await getTutorProfileById(tutorId);
  } catch (e: any) {
    error = e.message;
  }

  if (error || !tutor) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Error al Cargar Perfil</h1>
        <p className="text-gray-600 mt-2">{error || "El tutor no fue encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="flex-shrink-0 text-center">
              <img
                src={tutor.fotoUrlUsuario || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.nombreUsuario)}&size=128&background=0D8ABC&color=fff`}
                alt={`Foto de ${tutor.nombreUsuario}`}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200"
              />
              <div className="mt-4 flex justify-center text-yellow-400">{renderStars(tutor.estrellasPromedio)}</div>
              <span className="text-sm text-gray-500">({tutor.estrellasPromedio.toFixed(1)} de calificación)</span>
              <div className="mt-4 text-3xl font-bold text-blue-600">
                S/{tutor.tarifaHora}<span className="text-base font-normal text-gray-500"> / hora</span>
              </div>
            </div>
            <div className="flex-grow">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-2">{tutor.rubro}</span>
              <h1 className="text-4xl font-extrabold text-gray-900">{tutor.nombreUsuario}</h1>
              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Sobre mí</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{tutor.bio || 'Este tutor aún no ha añadido una biografía.'}</p>
              </div>
            </div>
          </div>
        </div>
        
          {/* Componente cliente para la funcionalidad de reserva */}
          <ReservaTutoria tutorId={tutor.id} tarifaHora={tutor.tarifaHora} />      
      </div>
    </div>
  );
}