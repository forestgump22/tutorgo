"use client";

import { useState, useEffect, useCallback } from 'react';
import { PagedResponse, TutorSummary } from '@/models/tutor.models';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllTutors } from '@/services/tutor.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

// ===================================================================
// Componente para una Tarjeta de Tutor Individual
// ===================================================================
const TutorCard = ({ tutor }: { tutor: TutorSummary }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStarSolid} className="text-blue-500" />);
        }
        const emptyStars = 5 - fullStars;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStarRegular} className="text-gray-300" />);
        }
        return stars;
    };

    return (
        <div className="tutor-list-card">
            <div className="tutor-card-info">
                <h3 className="tutor-card-name">{tutor.nombreUsuario}</h3>
                <p className="tutor-card-details">Disponible (Horarios en perfil)</p>
                <p className="tutor-card-details">Profesor de {tutor.rubro}</p>
                <Link href={`/tutores/${tutor.tutorId}`} className="tutor-card-link">
                    Más información
                </Link>
            </div>
            <div className="tutor-card-actions">
                <div className="tutor-card-rating">{renderStars(tutor.estrellasPromedio)}</div>
                <div className="tutor-card-preview">
                    <span>y' = x+y<br/>∫x dx = x²/2</span>
                </div>
            </div>
        </div>
    );
};

// ===================================================================
// Componente de Paginación
// ===================================================================
const Pagination = ({ pageNumber, totalPages, last }: { pageNumber: number; totalPages: number; last: boolean; }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pagination-controls">
            <button onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 0}>Anterior</button>
            <span>Página {pageNumber + 1} de {totalPages}</span>
            <button onClick={() => handlePageChange(pageNumber + 1)} disabled={last}>Siguiente</button>
        </div>
    );
};

// ===================================================================
// Componente de la Barra Lateral de Filtros
// ===================================================================
const FilterSidebar = ({ onFiltersChange, initialFilters }: { onFiltersChange: (filters: any) => void; initialFilters: any; }) => {
    const [filters, setFilters] = useState(initialFilters);

    // Este efecto llama a la función del padre cuando los filtros cambian,
    // con un pequeño retraso para no saturar de peticiones.
    useEffect(() => {
        const handler = setTimeout(() => {
            // Solo aplicamos si los filtros han cambiado realmente
            if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
                onFiltersChange(filters);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [filters, onFiltersChange, initialFilters]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <aside className="filter-sidebar">
            <h2 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={20} />
                <span>Filtrar Tutores</span>
            </h2>
            
            <div className="filter-group">
                <h3 className="filter-title">Puntuación</h3>
                <div className="filter-options">
                    {['4', '3', '2', '1'].map(score => (
                        <label key={score} className="filter-label">
                            <input type="radio" name="puntuacion" value={score} checked={filters.puntuacion === score} onChange={handleInputChange}/>
                            {score} estrellas o más
                        </label>
                    ))}
                    <label className="filter-label">
                        <input type="radio" name="puntuacion" value="" checked={!filters.puntuacion} onChange={handleInputChange}/>
                        Cualquier puntuación
                    </label>
                </div>
            </div>

            <div className="filter-group">
                <h3 className="filter-title">Precio Máximo</h3>
                <input type="range" min="0" max="150" step="5" name="maxPrecio" value={filters.maxPrecio} onChange={handleInputChange} className="w-full"/>
                <div className="price-range">
                    <span>S/ 0</span>
                    <span>S/ {filters.maxPrecio}</span>
                </div>
            </div>
        </aside>
    );
};

// ===================================================================
// Componente Principal de la Página del Cliente
// ===================================================================
export function TutorClientPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tutorData, setTutorData] = useState<PagedResponse<TutorSummary> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // El estado del término de búsqueda se lee de la URL
    const [query, setQuery] = useState(searchParams.get('query') || '');

    const initialFilters = {
        puntuacion: searchParams.get('puntuacion') || '',
        maxPrecio: searchParams.get('maxPrecio') || '150',
    };

    // Función para recargar los datos, memorizada con useCallback
    const fetchTutors = useCallback(() => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams(searchParams.toString());
        getAllTutors(params)
            .then(data => setTutorData(data))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [searchParams]);

    // useEffect que se dispara cada vez que la función fetchTutors cambia (es decir, cuando searchParams cambia)
    useEffect(() => {
        fetchTutors();
    }, [fetchTutors]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set('query', query.trim());
        } else {
            params.delete('query');
        }
        params.delete('page'); // Resetear a la primera página con cada nueva búsqueda
        router.push(`/buscar-tutores?${params.toString()}`);
    };

    const handleFiltersChange = (newFilters: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && String(value).trim() !== '' && !(key === 'maxPrecio' && value === '150')) {
                params.set(key, String(value));
            } else {
                params.delete(key);
            }
        });
        params.delete('page');
        router.push(`/buscar-tutores?${params.toString()}`);
    };

    return (
        <div className="search-page-container">
            <div className="search-layout">
                <FilterSidebar onFiltersChange={handleFiltersChange} initialFilters={initialFilters} />
                <div className="results-container">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Busca por nombre o materia..."
                                className="w-full p-3 pl-10 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" aria-label="Buscar" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </form>

                    {isLoading && <div className="loading-state">Cargando tutores...</div>}
                    {error && <div className="error-state">{error}</div>}
                    
                    {!isLoading && !error && tutorData && (
                        <div className="results-list">
                            <div className="text-sm text-gray-600 mb-4">Mostrando {tutorData.totalElements} tutores</div>
                            {tutorData.content.length === 0 ? (
                                <div className="empty-state">
                                    <p>No se encontraron tutores con los filtros seleccionados.</p>
                                </div>
                            ) : (
                                tutorData.content.map((tutor) => (
                                    <TutorCard key={tutor.tutorId} tutor={tutor} />
                                ))
                            )}
                            <Pagination 
                                pageNumber={tutorData.pageNumber} 
                                totalPages={tutorData.totalPages}
                                last={tutorData.last}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}