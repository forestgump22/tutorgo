"use client"

import { useState, type FormEvent, type ChangeEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/services/auth.service"
import type { RegisterRequest } from "@/models/auth.models"
import type { CentroEstudio } from "@/models/centroEstudio"
import { getAllCentrosEstudio } from "@/services/centroEstudio.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  User,
  Mail,
  Lock,
  GraduationCap,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  ArrowLeft,
} from "lucide-react"

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<"terms" | "register">("terms")
  const [selectedRole, setSelectedRole] = useState<"ESTUDIANTE" | "TUTOR">("ESTUDIANTE")
  const [termsAccepted, setTermsAccepted] = useState(false)

  const [formData, setFormData] = useState<RegisterRequest>({
    nombre: "",
    email: "",
    password: "",
    rol: "ESTUDIANTE",
    centroEstudioId: undefined,
    tarifaHora: undefined,
    rubro: "",
    bio: "",
    fotoUrl: "",
  })

  const [centrosEstudio, setCentrosEstudio] = useState<CentroEstudio[]>([])
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const data = await getAllCentrosEstudio()
        setCentrosEstudio(data)
      } catch (err) {
        setError("No se pudieron cargar los centros de estudio. Intenta recargar la página.")
      }
    }
    fetchCentros()
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tarifaHora" || name === "centroEstudioId" ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "centroEstudioId" ? Number(value) : value,
    }))
  }

  const handleRoleChange = (role: "ESTUDIANTE" | "TUTOR") => {
    setSelectedRole(role)
    setFormData((prev) => ({ ...prev, rol: role }))
  }

  const handleAcceptTerms = () => {
    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones para continuar.")
      return
    }
    setCurrentStep("register")
    setError(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Debe llenar todos los campos obligatorios (nombre, email, contraseña, rol).")
      setLoading(false)
      return
    }
    if (formData.rol === "TUTOR" && (!formData.tarifaHora || !formData.rubro?.trim())) {
      setError("Para tutores, la tarifa por hora y el rubro son obligatorios.")
      setLoading(false)
      return
    }
    if (formData.rol === "ESTUDIANTE" && !formData.centroEstudioId) {
      setError("Para estudiantes, seleccionar un centro de estudio es obligatorio.")
      setLoading(false)
      return
    }

    try {
      const response = await registerUser(formData)
      setSuccessMessage(response.message || "¡Registro exitoso! Redirigiendo al inicio de sesión...")

      setTimeout(() => {
        router.push("/login?message=Registro exitoso. Ahora puedes iniciar sesión.")
      }, 2500)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error durante el registro.")
    } finally {
      setLoading(false)
    }
  }

  const renderTermsContent = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FileText className="h-12 w-12 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h2>
        <p className="text-gray-600">Lee y acepta nuestros términos antes de continuar</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role-selection">Selecciona tu rol para ver los términos específicos:</Label>
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
              <SelectItem value="TUTOR">Tutor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Términos y Condiciones - {selectedRole === "ESTUDIANTE" ? "Estudiante" : "Tutor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 w-full rounded border p-4">
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Términos Generales</h4>
                  <p className="text-gray-700 leading-relaxed">
                    Al registrarte en TutorGo, aceptas cumplir con estos términos y condiciones. Nuestra plataforma
                    conecta estudiantes con tutores calificados para sesiones de aprendizaje personalizadas.
                  </p>
                </div>

                {selectedRole === "TUTOR" && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">2. Comisión por Sesión (Tutores)</h4>
                    <p className="text-yellow-700 leading-relaxed">
                      <strong>IMPORTANTE:</strong> Como tutor, TutorGo cobrará una comisión del
                      <span className="font-bold"> 10% (diez por ciento) sobre el monto de cada sesión completada</span>
                      . Esta comisión se descontará automáticamente de tus ganancias y cubre los costos de mantenimiento
                      de la plataforma, procesamiento de pagos y soporte técnico.
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedRole === "ESTUDIANTE"
                      ? "2. Responsabilidades del Estudiante"
                      : "3. Responsabilidades del Tutor"}
                  </h4>
                  {selectedRole === "ESTUDIANTE" ? (
                    <ul className="text-gray-700 space-y-1 list-disc list-inside">
                      <li>Asistir puntualmente a las sesiones programadas</li>
                      <li>Realizar el pago correspondiente por las sesiones</li>
                      <li>Mantener un comportamiento respetuoso con los tutores</li>
                      <li>Proporcionar información académica veraz</li>
                    </ul>
                  ) : (
                    <ul className="text-gray-700 space-y-1 list-disc list-inside">
                      <li>Proporcionar sesiones de calidad y preparadas</li>
                      <li>Mantener puntualidad y profesionalismo</li>
                      <li>Verificar credenciales académicas cuando sea requerido</li>
                      <li>Mantener la confidencialidad de la información del estudiante</li>
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedRole === "ESTUDIANTE" ? "3. Política de Pagos" : "4. Política de Pagos"}
                  </h4>
                  {selectedRole === "ESTUDIANTE" ? (
                    <p className="text-gray-700 leading-relaxed">
                      Los pagos se procesan de forma segura a través de nuestra plataforma. Puedes pagar por sesión
                      individual.
                    </p>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">
                      Los pagos se procesan inmediatamente después de pagar por la sesion. La comisión del 10% por
                      sesión se descuenta automáticamente. Los pagos se realizan mediante transferencia bancaria.
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedRole === "ESTUDIANTE" ? "4. Privacidad y Datos" : "5. Privacidad y Datos"}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Protegemos tu información personal según nuestra política de privacidad. Tus datos académicos y
                    personales se mantienen confidenciales y solo se comparten con tutores/estudiantes según sea
                    necesario para las sesiones.
                    {selectedRole === "TUTOR" &&
                      " Como tutor, tienes acceso limitado a información del estudiante necesaria para la sesión."}
                  </p>
                </div>

              

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedRole === "ESTUDIANTE" ? "5. Código de Conducta" : "7. Código de Conducta"}
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Mantén un ambiente de aprendizaje respetuoso y profesional. Cualquier comportamiento inapropiado,
                    acoso o violación de estos términos puede resultar en la suspensión de tu cuenta.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Última actualización: Enero 2024. TutorGo se reserva el derecho de modificar estos términos con
                    previo aviso.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            className="mt-1"
          />
          <div className="space-y-1">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Acepto los términos y condiciones
            </Label>
            <p className="text-xs text-gray-600">
              Al marcar esta casilla, confirmas que has leído y aceptas todos los términos y condiciones,
              {selectedRole === "TUTOR" && " incluyendo la comisión del 10% por sesión,"} así como nuestra política de
              privacidad.
            </p>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </Button>
          </Link>
          <Button onClick={handleAcceptTerms} disabled={!termsAccepted} className="flex-1">
            Continuar con el Registro
          </Button>
        </div>
      </div>
    </div>
  )

  const renderRegistrationForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setCurrentStep("terms")} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600">Completa tu información para registrarte</p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre Completo *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="pl-10"
              placeholder="Tu nombre completo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              placeholder="••••••••"
            />
          </div>
          <p className="text-xs text-gray-500">Mínimo 8 caracteres.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rol">Quiero registrarme como *</Label>
          <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
              <SelectItem value="TUTOR">Tutor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student Fields */}
        {formData.rol === "ESTUDIANTE" && (
          <div className="space-y-2">
            <Label htmlFor="centroEstudioId">Centro de Estudio *</Label>
            <Select
              value={formData.centroEstudioId?.toString() || ""}
              onValueChange={(value) => handleSelectChange("centroEstudioId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu centro de estudio" />
              </SelectTrigger>
              <SelectContent>
                {centrosEstudio.map((centro) => (
                  <SelectItem key={centro.id} value={centro.id.toString()}>
                    {centro.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tutor Fields */}
        {formData.rol === "TUTOR" && (
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Recordatorio:</strong> Se aplicará una comisión del 10% sobre cada sesión completada.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifaHora">Tarifa por Hora (S/) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="tarifaHora"
                  name="tarifaHora"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.tarifaHora || ""}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rubro">Rubro o Especialidad Principal *</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="rubro"
                  name="rubro"
                  type="text"
                  value={formData.rubro}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="Matemáticas, Física, Programación..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía Corta (opcional)</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Cuéntanos sobre tu experiencia y metodología de enseñanza..."
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fotoUrl">URL de Foto de Perfil (opcional)</Label>
          <Input
            id="fotoUrl"
            name="fotoUrl"
            type="url"
            placeholder="https://ejemplo.com/imagen.png"
            value={formData.fotoUrl}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            "Crear Cuenta"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-blue-600">TUTOR</div>
            <div className="text-3xl font-bold text-gray-800 ml-1">GO</div>
          </div>
          <p className="text-gray-600">{currentStep === "terms" ? "Términos y Condiciones" : "Crea tu cuenta"}</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {currentStep === "terms" ? renderTermsContent() : renderRegistrationForm()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
