"use client";

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { PagedResponse, TutorSummary } from '@/models/tutor.models';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllTutors } from '@/services/tutor.service';
import { Tema } from '@/models/tema.models';
import { getAllTemas } from '@/services/tema.service';
import { getTutorTemas } from '@/services/tutor-tema.service';
import { Search, SlidersHorizontal, Calendar, Clock, Trash2, Star, Loader2, Frown, User as UserIcon, Filter, X } from 'lucide-react';
import Link from 'next/link';

// Importando los componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";

// --- Componente de Tarjeta de Tutor (DISEÑO MEJORADO) ---
const TutorCard = ({ tutor }: { tutor: TutorSummary }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-amber-400 fill-amber-400" />);
        }
        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-4 w-4 text-amber-400 fill-amber-200" />);
        }
        for (let i = 0; i < 5 - fullStars - (hasHalfStar ? 1 : 0); i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
        }
        return stars;
    };

    return (
        <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar con efecto mejorado */}
                    <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                            <AvatarImage src={tutor.fotoUrlUsuario} alt={tutor.nombreUsuario} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                                {tutor.nombreUsuario?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                    </div>
                    
                    {/* Información del tutor */}
                    <div className="flex-grow text-center sm:text-left space-y-3">
                        <div className="space-y-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                                {tutor.rubro}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                {tutor.nombreUsuario}
                            </h3>
                        </div>
                        
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <div className="flex items-center gap-1">
                                {renderStars(tutor.estrellasPromedio)}
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {tutor.estrellasPromedio.toFixed(1)}
                            </span>
                            <Badge variant="outline" className="text-xs text-gray-500">
                                Verificado
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Precio y acción */}
                    <div className="flex flex-col items-center sm:items-end gap-4">
                        <div className="text-center sm:text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                S/{tutor.tarifaHora}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/hora</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Precio competitivo
                            </div>
                        </div>
                        
                        <Button 
                            asChild 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                        >
                            <Link href={`/tutores/${tutor.tutorId}`}>
                                Ver Perfil
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Componente de Paginación Mejorada ---
const CustomPagination = ({ pageNumber, totalPages, last }: { pageNumber: number; totalPages: number; last: boolean; }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Convertir entre la paginación basada en 0 del backend y la basada en 1 de la UI
    const currentUIPage = pageNumber + 1; // Página que se muestra al usuario (1, 2, 3...)
    
    const handlePageChange = (uiPageNumber: number) => {
        const backendPage = uiPageNumber - 1; // Convertir a base 0 para el backend
        if (backendPage < 0 || backendPage >= totalPages) return;
        
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', backendPage.toString()); // Guardar en base 0 en la URL
        router.push(`/buscar-tutores?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    // Generar páginas a mostrar
    const pagesToShow = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentUIPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pagesToShow.push(i);
    }

    return (
        <div className="flex justify-center mt-8">
            <Pagination>
                <PaginationContent className="gap-1">
                    {/* Botón Anterior */}
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentUIPage - 1)}
                            disabled={pageNumber === 0}
                            className={`${pageNumber === 0 ? 'opacity-50' : 'hover:bg-blue-50 hover:text-blue-600'} transition-colors`}
                        >
                            ← Anterior
                        </Button>
                    </PaginationItem>
                    
                    {/* Primera página si no está visible */}
                    {startPage > 1 && (
                        <>
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(1)}
                                    className="hover:bg-gray-50"
                                >
                                    1
                                </Button>
                            </PaginationItem>
                            {startPage > 2 && (
                                <PaginationItem>
                                    <span className="text-gray-400 px-2">...</span>
                                </PaginationItem>
                            )}
                        </>
                    )}
                    
                    {/* Páginas visibles */}
                    {pagesToShow.map((page) => (
                        <PaginationItem key={page}>
                            <Button
                                variant={page === currentUIPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={
                                    page === currentUIPage 
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
                                        : "hover:bg-gray-50"
                                }
                            >
                                {page}
                            </Button>
                        </PaginationItem>
                    ))}
                    
                    {/* Última página si no está visible */}
                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && (
                                <PaginationItem>
                                    <span className="text-gray-400 px-2">...</span>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(totalPages)}
                                    className="hover:bg-gray-50"
                                >
                                    {totalPages}
                                </Button>
                            </PaginationItem>
                        </>
                    )}
                    
                    {/* Botón Siguiente */}
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentUIPage + 1)}
                            disabled={last}
                            className={`${last ? 'opacity-50' : 'hover:bg-blue-50 hover:text-blue-600'} transition-colors`}
                        >
                            Siguiente →
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

// --- Componente de Sidebar de Filtros Mejorado ---
const FilterSidebar = ({ onFiltersChange, initialFilters, isMobile, onClose }: { 
    onFiltersChange: (filters: any) => void; 
    initialFilters: any; 
    isMobile?: boolean;
    onClose?: () => void;
}) => {
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const handler = setTimeout(() => {
            onFiltersChange(filters);
        }, 700);
        return () => clearTimeout(handler);
    }, [filters, onFiltersChange]);

    const handleInputChange = (name: string, value: string | number) => {
        setFilters((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleResetHorario = () => {
        setFilters((prev: any) => ({ ...prev, fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '' }));
    };

    const handleResetAllFilters = () => {
        setFilters({
            puntuacion: '',
            maxPrecio: '200',
            fechaInicio: '',
            fechaFin: '',
            horaInicio: '',
            horaFin: '',
        });
    };

    return (
        <Card className="sticky top-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                        Filtros
                    </CardTitle>
                    {isMobile && onClose && (
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 w-fit"
                >
                    Limpiar todos
                </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Disponibilidad */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        Disponibilidad
                    </h3>
                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="fechaInicio" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Desde
                                </Label>
                                <Input 
                                    type="date" 
                                    id="fechaInicio" 
                                    name="fechaInicio" 
                                    value={filters.fechaInicio} 
                                    onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="fechaFin" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Hasta
                                </Label>
                                <Input 
                                    type="date" 
                                    id="fechaFin" 
                                    name="fechaFin" 
                                    value={filters.fechaFin} 
                                    onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-orange-600" />
                                Horario
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="time" 
                                    name="horaInicio" 
                                    value={filters.horaInicio} 
                                    onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-gray-500 font-medium">a</span>
                                <Input 
                                    type="time" 
                                    name="horaFin" 
                                    value={filters.horaFin} 
                                    onChange={(e) => handleInputChange('horaFin', e.target.value)}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        {(filters.fechaInicio || filters.fechaFin || filters.horaInicio || filters.horaFin) && (
                            <Button 
                                onClick={handleResetHorario} 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 p-0 h-auto"
                            >
                                <Trash2 size={12} className="mr-1" />
                                Limpiar horario
                            </Button>
                        )}
                    </div>
                </div>
                
                {/* Puntuación */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Puntuación Mínima
                    </h3>
                    <RadioGroup 
                        defaultValue={filters.puntuacion || "any"} 
                        onValueChange={(value) => handleInputChange('puntuacion', value === "any" ? "" : value)} 
                        className="space-y-3"
                    >
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value="4" id="r1" className="border-blue-300 text-blue-600" />
                            <Label htmlFor="r1" className="flex items-center gap-2 cursor-pointer">
                                <div className="flex">
                                    {[...Array(4)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                    <Star className="h-3 w-3 text-gray-300" />
                                </div>
                                <span>4+ estrellas</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value="3" id="r2" className="border-blue-300 text-blue-600" />
                            <Label htmlFor="r2" className="flex items-center gap-2 cursor-pointer">
                                <div className="flex">
                                    {[...Array(3)].map((_, i) => (
                                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                    {[...Array(2)].map((_, i) => (
                                        <Star key={i + 3} className="h-3 w-3 text-gray-300" />
                                    ))}
                                </div>
                                <span>3+ estrellas</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                            <RadioGroupItem value="any" id="r3" className="border-blue-300 text-blue-600" />
                            <Label htmlFor="r3" className="cursor-pointer">Cualquier puntuación</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Precio */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Precio Máximo por Hora</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <Slider 
                            defaultValue={[parseInt(filters.maxPrecio, 10)]} 
                            max={200} 
                            step={10} 
                            onValueChange={(value) => handleInputChange('maxPrecio', value[0])}
                            className="my-4"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>S/ 0</span>
                            <span className="font-semibold text-blue-600">S/ {filters.maxPrecio}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// --- Componente Principal de la Página ---
export function TutorClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tutorData, setTutorData] = useState<PagedResponse<TutorSummary> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState(searchParams.get('query') || '');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [temas, setTemas] = useState<Tema[]>([]);
    const [temaSeleccionado, setTemaSeleccionado] = useState<number | null>(null);
    const [filteredTutors, setFilteredTutors] = useState<TutorSummary[]>([]);
    
    const initialFilters = {
        puntuacion: searchParams.get('puntuacion') || '',
        maxPrecio: searchParams.get('maxPrecio') || '200',
        fechaInicio: searchParams.get('fechaInicio') || '',
        fechaFin: searchParams.get('fechaFin') || '',
        horaInicio: searchParams.get('horaInicio') || '',
        horaFin: searchParams.get('horaFin') || '',
    };
    
    const fetchTutors = useCallback(() => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams(searchParams.toString());
        getAllTutors(params)
            .then(data => setTutorData(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [searchParams]);

    useEffect(() => {
        fetchTutors();
    }, [fetchTutors]);

    useEffect(() => {
        getAllTemas().then(setTemas).catch(() => setTemas([]));
    }, []);

    useEffect(() => {
        if (!temaSeleccionado) {
            setFilteredTutors(tutorData?.content || []);
            return;
        }
        // Filtrar tutores por tema seleccionado
        const fetchFilteredTutors = async () => {
            const filtered: TutorSummary[] = [];
            for (const tutor of tutorData?.content || []) {
                try {
                    const tutorTemas = await getTutorTemas(tutor.tutorId);
                    if (tutorTemas.some(tt => tt.temaId === temaSeleccionado)) {
                        filtered.push(tutor);
                    }
                } catch {}
            }
            setFilteredTutors(filtered);
        };
        fetchFilteredTutors();
    }, [temaSeleccionado, tutorData?.content]);
    
    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) params.set('query', query.trim());
        else params.delete('query');
        params.set('page', '0');
        router.push(`/buscar-tutores?${params.toString()}`);
    };

    const handleFiltersChange = useCallback((newFilters: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            const isDefault = (key === 'maxPrecio' && value === '200');
            if (value && String(value).trim() !== '' && !isDefault) {
                params.set(key, String(value));
            } else {
                params.delete(key);
            }
        });
        params.set('page', '0');
        router.push(`/buscar-tutores?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar de filtros - Desktop */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <FilterSidebar onFiltersChange={handleFiltersChange} initialFilters={initialFilters} />
                    </div>
                    
                    {/* Contenido principal */}
                    <div className="flex-1 space-y-6">
                        {/* Header con búsqueda */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-0">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <form onSubmit={handleSearch} className="flex-1 w-full">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="text"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Busca por nombre, materia o especialidad..."
                                            className="w-full pl-12 pr-4 py-4 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                                        />
                                    </div>
                                </form>
                                
                                {/* Botón de filtros móvil */}
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowMobileFilters(true)}
                                    className="lg:hidden whitespace-nowrap border-gray-200 hover:bg-blue-50"
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filtros
                                </Button>
                            </div>
                        </div>
                        
                        {/* Estados de carga, error y resultados */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-center space-y-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                                    <p className="text-gray-600">Buscando los mejores tutores...</p>
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <Card className="text-center py-16 bg-red-50 border-red-200">
                                <div className="text-red-600 font-semibold mb-2">Error al cargar los tutores</div>
                                <p className="text-red-500">{error}</p>
                            </Card>
                        )}
                        
                        {!isLoading && !error && tutorData && (
                            <div className="space-y-6">
                                {/* Información de resultados */}
                                <div className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                                    <div className="text-sm text-gray-600">
                                        Se encontraron <span className="font-bold text-blue-600">{tutorData.totalElements}</span> tutores disponibles
                                    </div>
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        {tutorData.content.length} en esta página
                                    </Badge>
                                </div>
                                
                                {/* Lista de tutores */}
                                {filteredTutors.length === 0 ? (
                                    <Card className="text-center py-20 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                        <div className="space-y-4">
                                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                                                <Frown className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">No se encontraron tutores</h3>
                                                <p className="text-gray-600 mt-2">Intenta ajustar tus filtros o cambiar tu búsqueda.</p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => window.location.href = '/buscar-tutores'}
                                                className="mt-4"
                                            >
                                                Limpiar filtros
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTutors.map((tutor) => (
                                            <TutorCard key={tutor.tutorId} tutor={tutor} />
                                        ))}
                                    </div>
                                )}
                                
                                {/* Paginación */}
                                <CustomPagination 
                                    pageNumber={tutorData.pageNumber} 
                                    totalPages={tutorData.totalPages}
                                    last={tutorData.last}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Modal de filtros móvil */}
            {showMobileFilters && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
                    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                        <div className="p-4">
                            <FilterSidebar 
                                onFiltersChange={handleFiltersChange} 
                                initialFilters={initialFilters}
                                isMobile
                                onClose={() => setShowMobileFilters(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}