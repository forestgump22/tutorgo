import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-4">
              TUTOR <span className="bg-blue-600 text-white px-1 rounded">GO</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              La plataforma educativa líder que conecta estudiantes con tutores expertos.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400" /></Link>
              {/* ... otros iconos */}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="#" className="hover:text-white">Encontrar Tutores</Link></li>
              {/* ... otros links */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="#" className="hover:text-white">Centro de Ayuda</Link></li>
               {/* ... otros links */}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">© 2024 TutorGO. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}