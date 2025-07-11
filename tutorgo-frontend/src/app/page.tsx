import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Shield,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  UserCheck,
  MessageSquare,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Footer } from "@/components/shared/Footer"
import FloatingChat, { ChatProvider } from "@/components/ai/floating-chat"

export default function LandingPage() {
  return (
    <ChatProvider>
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">TutorGo</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#caracteristicas" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Características
          </Link>
          <Link href="#como-funciona" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Cómo Funciona
          </Link>
          <Link href="#estudiantes" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Estudiantes
          </Link>
          <Link href="#tutores" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Tutores
          </Link>
          <Link href="#testimonios" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Testimonios
          </Link>
          <Link href="#equipo" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Equipo
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">

              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Plataforma Educativa Digital
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Transformamos el Apoyo Académico
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Conectamos estudiantes con tutores calificados mediante una plataforma digital segura, accesible y
                    centrada en la mejora del aprendizaje. Tu éxito académico es nuestra misión.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/login">
                      Comenzar Ahora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg">
                    Ver Demo
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Registro gratuito</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Tutores verificados</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Soporte 24/7</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Image
                    src="/imagenes/perfirtutorgo.png"
                    width="400"
                    height="400"
                    alt="Estudiantes y tutores conectándose"
                    className="mx-auto aspect-square overflow-hidden rounded-xl object-cover shadow-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-semibold">4.9/5</span>
                      <span className="text-sm text-gray-600">+1000 estudiantes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 1: Características Principales */}
        <section id="caracteristicas" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-purple-100 text-purple-800">Características</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Todo lo que necesitas para el éxito académico
                </h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {/* ESPACIO 1: Agrega aquí información sobre las características principales de tu plataforma */}
                  Nuestra plataforma ofrece herramientas avanzadas para facilitar el aprendizaje y la enseñanza. Desde
                  sesiones en vivo hasta recursos compartidos, todo está diseñado para maximizar el potencial educativo.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader>
                  <Shield className="h-10 w-10 text-blue-600" />
                  <CardTitle>Plataforma Segura</CardTitle>
                  <CardDescription>
                    Protección de datos y verificación de identidad para un entorno de aprendizaje confiable.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 hover:border-purple-200 transition-colors">
                <CardHeader>
                  <Users className="h-10 w-10 text-purple-600" />
                  <CardTitle>Tutores Calificados</CardTitle>
                  <CardDescription>
                    Red de profesionales verificados con experiencia comprobada en sus áreas de especialización.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 hover:border-green-200 transition-colors">
                <CardHeader>
                  <Clock className="h-10 w-10 text-green-600" />
                  <CardTitle>Acceso 24/7</CardTitle>
                  <CardDescription>
                    Aprende cuando quieras, donde quieras. Flexibilidad total para adaptarse a tu horario.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Sección 2: Cómo Funciona */}
        <section id="como-funciona" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-800">Proceso Simple</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Cómo funciona nuestra plataforma</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {/* ESPACIO 2: Agrega aquí información sobre el proceso paso a paso de tu plataforma */}
                  Un proceso intuitivo y eficiente que te conecta con el tutor perfecto en minutos. Desde el registro
                  hasta la primera sesión, cada paso está optimizado para tu comodidad.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold">Regístrate</h3>
                <p className="text-gray-600">
                  Crea tu perfil y cuéntanos sobre tus necesidades académicas específicas.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold">Encuentra tu Tutor</h3>
                <p className="text-gray-600">
                  Explora perfiles de tutores calificados y elige el que mejor se adapte a ti.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold">Comienza a Aprender</h3>
                <p className="text-gray-600">
                  Programa tu primera sesión y comienza tu viaje hacia el éxito académico.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 3: Para Estudiantes */}
        <section id="estudiantes" className="w-full py-12 md:py-24 lg:py-32">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="w-fit bg-green-100 text-green-800">Para Estudiantes</Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Potencia tu aprendizaje</h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    {/* ESPACIO 3: Agrega aquí información específica para estudiantes */}
                    Descubre una nueva forma de aprender con apoyo personalizado, recursos exclusivos y un seguimiento
                    continuo de tu progreso académico. Tu éxito es nuestra prioridad.
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Sesiones personalizadas según tu ritmo de aprendizaje</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Acceso a materiales de estudio exclusivos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Seguimiento detallado de tu progreso</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Soporte académico continuo</span>
                  </li>
                </ul>
                <Button className="w-fit bg-green-600 hover:bg-green-700">
                  <Link href={"/register"}>
                  Únete como Estudiante
                  </Link>
                </Button>
              </div>
              <Image
                src="/imagenes/paraestudiantes2.jpg"
                width="550"
                height="400"
                alt="Estudiante aprendiendo"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              />
            </div>
          </div>
        </section>

        {/* Sección 4: Para Tutores */}
        <section id="tutores" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[500px_1fr] lg:gap-12 xl:grid-cols-[550px_1fr]">
              <Image
                src="/imagenes/libros.jpg"
                width="550"
                height="400"
                alt="Tutor enseñando"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="w-fit bg-orange-100 text-orange-800">Para Tutores</Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Comparte tu conocimiento</h2>
                  <p className="max-w-[600px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    {/* ESPACIO 4: Agrega aquí información específica para tutores */}
                    Únete a nuestra comunidad de educadores y ayuda a transformar vidas a través de la educación.
                    Herramientas profesionales, flexibilidad total y una plataforma que valora tu experiencia.
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-orange-600" />
                    <span>Proceso de verificación profesional</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Horarios flexibles que se adaptan a ti</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-600" />
                    <span>Herramientas de comunicación avanzadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-600" />
                    <span>Sistema de reputación y reseñas</span>
                  </li>
                </ul>
                <Button className="w-fit bg-orange-600 hover:bg-orange-700">
                  <Link href={"/register"}>
                  Únete como Tutor
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Testimonios y Estadísticas */}
        <section id="testimonios" className="w-full py-12 md:py-24 lg:py-32">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-yellow-100 text-yellow-800">Testimonios</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Lo que dicen nuestros usuarios</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {/* ESPACIO 5: Agrega aquí testimonios, estadísticas o casos de éxito */}
                  Miles de estudiantes han transformado su experiencia académica con nuestra plataforma. Descubre las
                  historias de éxito que nos motivan a seguir innovando en educación.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <CardDescription>
                    "Increíble plataforma que me ayudó a mejorar mis calificaciones en matemáticas. Mi tutor fue muy
                    paciente y profesional."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">María González</p>
                  <p className="text-sm text-gray-600">Estudiante de Ingeniería</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <CardDescription>
                    "Como tutor, esta plataforma me ha permitido llegar a más estudiantes y organizar mejor mis sesiones
                    de enseñanza."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Dr. Carlos Ruiz</p>
                  <p className="text-sm text-gray-600">Tutor de Física</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <CardDescription>
                    "La flexibilidad de horarios y la calidad de los tutores han hecho que mi experiencia de aprendizaje
                    sea excepcional."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">Ana Martínez</p>
                  <p className="text-sm text-gray-600">Estudiante de Medicina</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600">Estudiantes Activos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">200+</div>
                <div className="text-sm text-gray-600">Tutores Verificados</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Satisfacción</div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del Equipo Creador */}
        <section id="equipo" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-indigo-100 text-indigo-800">Nuestro Equipo</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Conoce a los Creadores de TutorGo</h2>
                <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Somos un equipo apasionado de estudiantes y desarrolladores comprometidos con revolucionar la
                  educación. Nuestra visión es crear un mundo donde cada estudiante tenga acceso a la mejor educación
                  personalizada, sin importar su ubicación o circunstancias. Creemos firmemente que la tecnología puede
                  ser el puente que conecte el conocimiento con quienes más lo necesitan.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-8">
              <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <Image
                  src={"/imagenes/cesar.png"}
                  alt="Foto de Cesar"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">Cesar Joaquin Alvarado Osorio</CardTitle>
                  <CardDescription className="text-indigo-600 font-medium">
                    Co-Fundador & Líder de Proyecto
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Visionario del proyecto, enfocado en crear soluciones educativas innovadoras que transformen vidas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <Image
                  src={"/imagenes/Imanol.png"}
                  alt="Foto de Imanol"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">Ibrahim Imanol Jordi Arquinigo Jacinto</CardTitle>
                  <CardDescription className="text-green-600 font-medium">
                    Co-Fundador & Arquitecto de Software
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Especialista en desarrollo backend y arquitectura de sistemas, garantizando la escalabilidad de la
                    plataforma.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <Image
                  src={"/imagenes/Ian.png"}
                  alt="Foto de Ian"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">Ian Joaquin Sanchez Alva</CardTitle>
                  <CardDescription className="text-purple-600 font-medium">
                    Co-Fundador & Diseñador UX/UI
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Experto en experiencia de usuario, creando interfaces intuitivas que facilitan el aprendizaje.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg lg:col-start-1 lg:col-end-2 lg:mx-auto">
                <CardHeader className="text-center">
                  <Image
                  src={"/imagenes/Bruno.png"}
                  alt="Foto de  Bruno"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">Bruno Alessandro Medina Agnini</CardTitle>
                  <CardDescription className="text-orange-600 font-medium">
                    Co-Fundador & Desarrollador Frontend
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Especialista en tecnologías frontend modernas, creando experiencias web fluidas y responsivas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg lg:col-start-3 lg:col-end-4 lg:mx-auto">
                <CardHeader className="text-center">
                  <Image
                  src={"/imagenes/Christian.png"}
                  alt="Foto de Chrisian"
                  width={80}
                  height={80}
                  className="mx-auto rounded-full mb-4 object-cover"
                  />
                  <CardTitle className="text-lg">Christian Aaron Velasquez Borasino</CardTitle>
                  <CardDescription className="text-teal-600 font-medium">
                    Co-Fundador & Especialista en Calidad
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Enfocado en asegurar la calidad del software y optimizar los procesos de desarrollo del equipo.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Card className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestro Compromiso</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    "Como equipo, nos comprometemos a democratizar la educación de calidad. Cada línea de código, cada
                    decisión de diseño y cada funcionalidad está pensada para acercar a estudiantes y tutores de manera
                    significativa. Creemos que la educación personalizada no debe ser un privilegio, sino un derecho
                    accesible para todos."
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600">
                    <GraduationCap className="h-6 w-6" />
                    <span className="font-semibold">- El Equipo TutorGo</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600">
  <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  ¿Listo para transformar tu experiencia académica?
                </h2>
                <p className="max-w-[600px] mx-auto text-blue-100 text-center md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
  Únete a miles de estudiantes que ya están alcanzando sus metas académicas con nuestra plataforma.
</p>

              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Tu correo electrónico"
                    className="max-w-lg flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                  <Button type="submit" variant="secondary">
                    Comenzar
                  </Button>
                </form>
                <p className="text-xs text-blue-100">
                  Al registrarte, aceptas nuestros{" "}
                  <Link href="/terminos" className="underline underline-offset-2 hover:text-white">
                    Términos y Condiciones
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <FloatingChat />
      <Footer />
    </div>
    </ChatProvider>
  )
}
