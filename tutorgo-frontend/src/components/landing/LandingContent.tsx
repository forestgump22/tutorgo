// src/app/components/landing/LandingContent.tsx

"use client"; // Necesario para useState (para el carrusel de testimonios)

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faLaptopCode, faShieldHalved, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular, faStarHalfAlt as faStarHalfRegular } from '@fortawesome/free-regular-svg-icons'; // Para estrellas vacías
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'; // Para estrellas llenas

// --- DATOS SIMULADOS ---
const mockTutors = [
  { tutorId: 1, nombreUsuario: 'Ana García', fotoUrlUsuario: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=500', rubro: 'Matemáticas', estrellasPromedio: 4.8, tarifaHora: 50, bioCorta: "Ingeniera con 5+ años ayudando a conquistar el cálculo y el álgebra." },
  { tutorId: 2, nombreUsuario: 'Carlos Rodríguez', fotoUrlUsuario: 'https://images.unsplash.com/photo-1580894732444-84cf4b76a0fd?w=500', rubro: 'Programación', estrellasPromedio: 5.0, tarifaHora: 70, bioCorta: "Desarrollador Full-Stack enseñando Python, JavaScript y React." },
  { tutorId: 3, nombreUsuario: 'Lucía Martínez', fotoUrlUsuario: 'https://images.unsplash.com/photo-1594744800539-837645915993?w=500', rubro: 'Física', estrellasPromedio: 4.5, tarifaHora: 60, bioCorta: "Física teórica. Hago que la mecánica cuántica sea fácil de entender." },
];

const testimonials = [
  {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    author: 'Sofía Valdivia',
    role: 'Estudiante de Ingeniería',
    text: 'TutorGo me salvó en Cálculo. Mi tutora fue increíblemente paciente y clara. ¡Totalmente recomendado!'
  },
  {
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    author: 'Mateo Rojas',
    role: 'Estudiante de Secundaria',
    text: 'Las clases de programación eran confusas hasta que usé TutorGo. Ahora entiendo y disfruto programar.'
  },
  {
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    author: 'Camila Flores',
    role: 'Universitaria',
    text: 'La flexibilidad de horarios y la calidad de los tutores es insuperable. Pude prepararme para mis finales sin estrés.'
  }
];

const teamMembers = [
  { code: "u20191e650", name: "Ibrahim Imanol", lastName: "Arquinigo Jacinto", avatar: "https://avatars.githubusercontent.com/u/10291035?v=4" },
  { code: "u202312801", name: "Cesar Joaquin", lastName: "Alvarado Osorio", avatar: `https://i.pravatar.cc/150?u=u202312801` },
  { code: "u202124676", name: "Ian Joaquin", lastName: "Sanchez Alva", avatar: `https://i.pravatar.cc/150?u=u202124676` },
  { code: "u202216661", name: "Bruno Alessandro", lastName: "Medina Agnini", avatar: `https://i.pravatar.cc/150?u=u202216661` },
  { code: "u202218075", name: "Christian Aaron", lastName: "Velasquez Borasino", avatar: `https://i.pravatar.cc/150?u=u202218075` },
];

// --- COMPONENTES AUXILIARES ---
const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0 && rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStarSolid} className="text-yellow-400" />);
    if (halfStar) stars.push(<FontAwesomeIcon key="half" icon={faStarHalfRegular} className="text-yellow-400" />);
    for (let i = 0; i < 5 - fullStars - (halfStar ? 1 : 0); i++) stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStarRegular} className="text-gray-300" />);
    
    return stars;
};

// --- COMPONENTE PRINCIPAL DE LA LANDING ---
export function LandingContent() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <>
      {/* SECCIÓN 1: HERO */}
      <section className="hero">
        <div className="container mx-auto py-16 md:py-24 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white">
            Desbloquea tu Potencial.<br className="hidden md:block" /> Aprende Sin Límites.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
            Encuentra al tutor perfecto para ti. Clases personalizadas que se adaptan a tu horario y estilo de aprendizaje.
          </p>
          <a href="#tutors" className="btn btn-primary text-lg px-8 py-3">
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
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Tutores Verificados</h3>
                    <p className="text-gray-600">Cada tutor pasa por un riguroso proceso de selección para garantizar su experiencia y calidad.</p>
                </div>
                 <div className="benefit-card">
                    <FontAwesomeIcon icon={faLaptopCode} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Aprendizaje a tu Medida</h3>
                    <p className="text-gray-600">Clases 100% adaptadas a tus necesidades, enfocándose donde necesitas más ayuda.</p>
                </div>
                <div className="benefit-card">
                    <FontAwesomeIcon icon={faShieldHalved} className="benefit-icon" />
                    <h3 className="text-xl font-bold mb-2">Pagos Seguros y Fáciles</h3>
                    <p className="text-gray-600">Reserva y paga con total confianza a través de nuestra plataforma segura y transparente.</p>
                </div>
            </div>
        </div>
      </section>

      {/* SECCIÓN 3: TUTORES DESTACADOS */}
      <section id="tutors" className="section">
        <div className="container mx-auto">
          <h2 className="section-title">Conoce a Nuestros Tutores Estrella</h2>
          <p className="section-subtitle">Expertos apasionados por enseñar y listos para ayudarte a alcanzar tus metas.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockTutors.map(tutor => (
              <div key={tutor.tutorId} className="tutor-card">
                <img src={tutor.fotoUrlUsuario} alt={tutor.nombreUsuario} className="tutor-card-img" />
                <div className="tutor-card-body">
                  <span className="tutor-subject">{tutor.rubro}</span>
                  <h3 className="text-xl font-bold my-2 text-gray-800">{tutor.nombreUsuario}</h3>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{tutor.bioCorta}</p>
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
      <section className="testimonial-section">
          <div className="container mx-auto">
            <h2 className="section-title text-white">Lo que dicen nuestros estudiantes</h2>
            <div className="testimonial-slider">
              <button aria-label="Testimonio anterior" className="testimonial-arrow left" onClick={prevTestimonial}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <div className="testimonial-horizontal">
                <img className="testimonial-avatar" src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].author} />
                <div className="testimonial-content">
                  <blockquote>
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="testimonial-author-info">
                    <strong>{testimonials[currentTestimonial].author}</strong><br/>
                    <span>{testimonials[currentTestimonial].role}</span>
                  </div>
                </div>
              </div>
              <button aria-label="Siguiente testimonio" className="testimonial-arrow right" onClick={nextTestimonial}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
      </section>
      
      {/* SECCIÓN 5: NUESTRO EQUIPO */}
      <section className="landing-team" id="equipo">
        <h2 className="section-title">Nuestro Equipo</h2>
        <p className="section-subtitle">
          El grupo de desarrolladores apasionados detrás de la creación y el éxito de TutorGo.
        </p>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.code} className="team-card">
              <img src={member.avatar} alt={`Foto de ${member.name} ${member.lastName}`} className="team-photo" />
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <h4 className="team-lastname">{member.lastName}</h4>
                <p className="team-code">{member.code}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 6: CTA FINAL */}
      <section className="section text-center bg-blue-50">
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">¿Listo para empezar a aprender?</h2>
            <p className="text-lg text-gray-600 my-6 max-w-xl mx-auto">Tu próximo gran logro académico está a solo un clic de distancia. Únete a miles de estudiantes que ya están alcanzando sus metas.</p>
            <a href="/register" className="btn btn-primary text-lg px-10 py-3 mt-4">
                ¡Regístrate Gratis!
            </a>
        </div>
      </section>
    </>
  );
}