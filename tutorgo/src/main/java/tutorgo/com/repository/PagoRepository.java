package tutorgo.com.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Pago;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Para el historial del estudiante: pagos donde él es el estudiante
    // Ordenamos por ID descendente para mostrar los más recientes primero
    @Query("SELECT p FROM Pago p JOIN FETCH p.tutor t JOIN FETCH t.user WHERE p.estudiante.id = :estudianteId")
    Page<Pago> findByEstudianteIdWithDetails(Long estudianteId, Pageable pageable);
    // Si no tuvieras fecha_pago, ordenar por p.id DESC es una opción

    // Para el historial del tutor: pagos donde él es el tutor
    @Query("SELECT p FROM Pago p JOIN FETCH p.estudiante e JOIN FETCH e.user WHERE p.tutor.id = :tutorId")
    Page<Pago> findByTutorIdWithDetails(Long tutorId, Pageable pageable);
    // Si no tuvieras fecha_pago, ordenar por p.id DESC
}