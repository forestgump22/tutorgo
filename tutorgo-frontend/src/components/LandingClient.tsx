// app/components/LandingClient.tsx

"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faAward, faUserTie, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

// --- DATOS SIMULADOS ---
const mockTutors = [
  { tutorId: 1, nombreUsuario: 'Ana García', fotoUrlUsuario: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500', rubro: 'Matemáticas', estrellasPromedio: 4.8, tarifaHora: 50, bioCorta: "Ingeniera con 5+ años de experiencia ayudando a estudiantes a conquistar el cálculo y el álgebra." },
  { tutorId: 2, nombreUsuario: 'Carlos Rodríguez', fotoUrlUsuario: 'https://images.unsplash.com/photo-1580894732444-84cf4b76a0fd?w=500', rubro: 'Programación', estrellasPromedio: 5.0, tarifaHora: 70, bioCorta: "Desarrollador Full-Stack apasionado por enseñar Python, JavaScript y React a la próxima generación." },
  { tutorId: 3, nombreUsuario: 'Lucía Martínez', fotoUrlUsuario: 'https://images.unsplash.com/photo-1594744800539-837645915993?w=500', rubro: 'Física', estrellasPromedio: 4.5, tarifaHora: 60, bioCorta: "Física teórica con maestría. Hago que la mecánica cuántica y la relatividad sean fáciles de entender." },
];

const testimonials = [
    { name: "Sofía V.", role: "Estudiante de Ingeniería", text: "Gracias a TutorGo, pasé de un 12 a un 18 en mi curso de Cálculo II. ¡Mi tutora fue increíblemente paciente y clara!", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    { name: "Mateo R.", role: "Estudiante de Secundaria", text: "Las clases de química eran mi pesadilla. Ahora, no solo apruebo, ¡sino que me gustan! 100% recomendado.", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
];

// --- COMPONENTES AUXILIARES ---
const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />);
    if (halfStar) stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} />);
    for (let i = 0; i < 5 - fullStars - (halfStar ? 1 : 0); i++) stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStarEmpty as any} />);
    
    return stars;
};

// --- COMPONENTE PRINCIPAL DE LA LANDING ---
export function LandingClient() {
  return (
    <div>
      {/* SECCIÓN 1: HERO */}
      <section className="hero">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Desbloquea tu Potencial. Aprende Sin Límites.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Encuentra al tutor perfecto para ti. Clases personalizadas que se adaptan a tu horario y estilo de aprendizaje.
          </p>
          <a href="#tutors" className="btn btn-primary text-lg">
            Ver Tutores
          </a>
        </div>
      </section>

      {/* SECCIÓN 2: BENEFICIOS */}
      <section className="section bg-white">
        <div className="container mx-auto">
            <h2 className="section-title">¿Por qué elegir TutorGo?</h2>
            <p className="section-subtitle">Te ofrecemos más que una simple clase. Te damos las herramientas para triunfar.</p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="benefit-card">
                    <FontAwesomeIcon icon={faUserTie} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Tutores Verificados</h3>
                    <p className="text-gray-600">Cada tutor pasa por un riguroso proceso de selección para garantizar su experiencia y calidad de enseñanza.</p>
                </div>
                 <div className="benefit-card">
                    <FontAwesomeIcon icon={faAward} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Aprendizaje a tu Medida</h3>
                    <p className="text-gray-600">Las clases se adaptan 100% a tus necesidades, enfocándose en los temas donde necesitas más ayuda.</p>
                </div>
                <div className="benefit-card">
                    <FontAwesomeIcon icon={faShieldHalved} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Pagos Seguros y Fáciles</h3>
                    <p className="text-gray-600">Reserva y paga tus clases con total confianza a través de nuestra plataforma segura y transparente.</p>
                </div>
            </div>
        </div>
      </section>

      {/* SECCIÓN 3: TUTORES DESTACADOS */}
      <section id="tutors" className="section">
        <div className="container mx-auto">
          <h2 className="section-title">Conoce a Nuestros Tutores Estrella</h2>
          <p className="section-subtitle">Expertos apasionados por enseñar y listos para ayudarte a alcanzar tus metas.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockTutors.map(tutor => (
              <div key={tutor.tutorId} className="tutor-card">
                <img src={tutor.fotoUrlUsuario} alt={tutor.nombreUsuario} className="tutor-card-img" />
                <div className="tutor-card-body">
                  <span className="tutor-subject">{tutor.rubro}</span>
                  <h3 className="text-xl font-bold my-2 text-gray-800">{tutor.nombreUsuario}</h3>
                  <p className="text-gray-600 text-sm mb-4 min-h-[60px]">{tutor.bioCorta}</p>
                  <div className="tutor-rating">
                    {renderStars(tutor.estrellasPromedio)}
                    <span className="ml-2">({tutor.estrellasPromedio.toFixed(1)})</span>
                  </div>
                  <div className="price mt-4">
                    S/{tutor.tarifaHora} <span>/ hora</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: TESTIMONIOS */}
      <section className="section bg-gray-900 text-white testimonial-section">
          <div className="container mx-auto">
            <h2 className="section-title text-white">Lo que dicen nuestros estudiantes</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-card">
                        <p className="testimonial-text">"{testimonial.text}"</p>
                        <div className="testimonial-author">
                            <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                            <div>
                                <div className="font-bold">{testimonial.name}</div>
                                <div className="text-sm text-gray-400">{testimonial.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </section>
      
      {/* SECCIÓN 5: CALL TO ACTION FINAL */}
      <section className="section text-center">
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">¿Listo para empezar a aprender?</h2>
            <p className="text-lg text-gray-600 my-4">Tu próximo gran logro académico está a solo un clic de distancia.</p>
            <a href="#" className="btn btn-primary text-lg mt-4">
                Encuentra tu tutor ahora
            </a>
        </div>
      </section>

    </div>
  );
}