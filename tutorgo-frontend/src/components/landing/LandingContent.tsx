"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  BookOpen,
  Users,
  Star,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  Target,
  ChevronLeft,
} from "lucide-react";
import { Badge } from '../ui/badge';

// --- DATOS SIMULADOS (MOCKS) ---
const mockTutors = [
  { tutorId: 1, nombreUsuario: 'Ana García', fotoUrlUsuario: '/placeholders/tutor-1.jpg', rubro: 'Matemáticas', estrellasPromedio: 4.8, tarifaHora: 50 },
  { tutorId: 2, nombreUsuario: 'Carlos Rodríguez', fotoUrlUsuario: '/placeholders/tutor-2.jpg', rubro: 'Programación', estrellasPromedio: 5.0, tarifaHora: 70 },
  { tutorId: 3, nombreUsuario: 'Lucía Martínez', fotoUrlUsuario: '/placeholders/tutor-3.jpg', rubro: 'Física', estrellasPromedio: 4.5, tarifaHora: 60 },
];

const testimonials = [
  { avatar: '/placeholders/student-1.jpg', author: 'Sofía Valdivia', role: 'Estudiante de Ingeniería', text: 'TutorGo me salvó en Cálculo. Mi tutora fue increíblemente paciente y clara. ¡Totalmente recomendado!' },
  { avatar: '/placeholders/student-2.jpg', author: 'Mateo Rojas', role: 'Estudiante de Secundaria', text: 'Las clases de programación eran confusas hasta que usé TutorGo. Ahora entiendo y disfruto programar.' },
  { avatar: '/placeholders/student-3.jpg', author: 'Camila Flores', role: 'Universitaria', text: 'La flexibilidad de horarios y la calidad de los tutores es insuperable. Pude prepararme para mis finales sin estrés.' }
];

// --- COMPONENTES AUXILIARES ---
const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
        stars.push(<Star key={i} className={`h-4 w-4 ${i < fullStars ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />);
    }
    return <div className="flex gap-0.5">{stars}</div>;
};

export function LandingContent() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <>
      {/* SECCIÓN HERO */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-balance">
            Desbloquea tu Potencial Académico
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-blue-100">
            Conecta con tutores expertos verificados y alcanza tus metas. Clases personalizadas, flexibles y a tu ritmo.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-100 shadow-lg">
                <Link href="/register">Empezar Ahora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:text-white">
                <Link href="/buscar-tutores">Buscar Tutores</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECCIÓN BENEFICIOS */}
      <section id="how-it-works" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">¿Por qué elegir TutorGO?</h2>
            <p className="mt-4 text-muted-foreground">Te ofrecemos más que una simple clase. Te damos las herramientas para triunfar.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex p-3 bg-blue-100 rounded-full"><ShieldCheck className="h-6 w-6 text-blue-600" /></div>
              <h3 className="text-xl font-semibold">Tutores Verificados</h3>
              <p className="text-muted-foreground">Cada tutor pasa por un riguroso proceso de selección para garantizar su experiencia y calidad.</p>
            </div>
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex p-3 bg-green-100 rounded-full"><Target className="h-6 w-6 text-green-600" /></div>
              <h3 className="text-xl font-semibold">Aprendizaje a tu Medida</h3>
              <p className="text-muted-foreground">Clases 100% adaptadas a tus necesidades, enfocándose donde necesitas más ayuda.</p>
            </div>
            <div className="text-center p-6 space-y-3">
              <div className="inline-flex p-3 bg-purple-100 rounded-full"><CalendarDays className="h-6 w-6 text-purple-600" /></div>
              <h3 className="text-xl font-semibold">Horarios Flexibles</h3>
              <p className="text-muted-foreground">Encuentra el momento perfecto para aprender sin afectar tu rutina diaria.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN TUTORES DESTACADOS */}
      <section id="tutors" className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Conoce a Nuestros Tutores Estrella</h2>
            <Button asChild variant="ghost">
              <Link href="/buscar-tutores">Ver todos <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockTutors.map(tutor => (
              <Card key={tutor.tutorId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                    <div className="h-40 bg-gray-200"><Image src={tutor.fotoUrlUsuario} alt={tutor.nombreUsuario} width={400} height={200} className="w-full h-full object-cover" /></div>
                    <div className="p-6">
                        <Badge variant="outline" className="mb-3">{tutor.rubro}</Badge>
                        <h3 className="text-xl font-bold">{tutor.nombreUsuario}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            {renderStars(tutor.estrellasPromedio)}
                            <span>({tutor.estrellasPromedio})</span>
                        </div>
                         <div className="mt-4 flex justify-between items-center">
                             <span className="text-lg font-bold text-primary">S/{tutor.tarifaHora}<span className="text-sm font-normal text-muted-foreground">/hr</span></span>
                             <Button asChild><Link href={`/tutores/${tutor.tutorId}`}>Reservar</Link></Button>
                         </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN TESTIMONIOS */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">Lo que dicen nuestros estudiantes</h2>
            <p className="mt-4 text-gray-300">Historias reales de estudiantes que han transformado su aprendizaje con TutorGO.</p>
          </div>
          <div className="relative mt-12">
            <div className="overflow-hidden relative h-64">
                {testimonials.map((testimonial, index) => (
                    <div key={index} className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentTestimonial ? 'opacity-100' : 'opacity-0'}`}>
                        <Card className="bg-gray-800 border-gray-700 h-full">
                            <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full">
                                <p className="text-lg italic text-gray-200">"{testimonial.text}"</p>
                                <div className="mt-6 flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} />
                                        <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{testimonial.author}</div>
                                        <div className="text-sm text-gray-400">{testimonial.role}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="icon" onClick={prevTestimonial} className="absolute left-0 sm:-left-6 top-1/2 -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 border-gray-600 text-white"><ChevronLeft/></Button>
            <Button variant="outline" size="icon" onClick={nextTestimonial} className="absolute right-0 sm:-right-6 top-1/2 -translate-y-1/2 bg-gray-800/50 hover:bg-gray-700/80 border-gray-600 text-white"><ChevronRight/></Button>
          </div>
        </div>
      </section>
    </>
  );
}