package tutorgo.com.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Pago;

import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Para el historial del estudiante: pagos donde él es el estudiante
    // Ordenamos por ID descendente para mostrar los más recientes primero
    @Query("SELECT p FROM Pago p " +
            "JOIN FETCH p.tutor t " +
            "JOIN FETCH t.user " +
            "JOIN FETCH p.estudiante e " +
            "JOIN FETCH e.user " +
            "WHERE e.id = :estudianteId ORDER BY p.id DESC")
    List<Pago> findByEstudianteIdWithDetails(@Param("estudianteId") Long estudianteId);

    @Query("SELECT p FROM Pago p " +
            "JOIN FETCH p.tutor t " +
            "JOIN FETCH t.user " +
            "JOIN FETCH p.estudiante e " +
            "JOIN FETCH e.user " +
            "WHERE t.id = :tutorId ORDER BY p.id DESC")
    List<Pago> findByTutorIdWithDetails(@Param("tutorId") Long tutorId);
    // Si no tuvieras fecha_pago, ordenar por p.id DESC

    // Busca los pagos donde el ID del estudiante coincide
    // Ordenamos por ID descendente para mostrar los más recientes primero
    List<Pago> findByEstudianteIdOrderByIdDesc(Long estudianteId);

    // Busca los pagos donde el ID del tutor coincide
    List<Pago> findByTutorIdOrderByIdDesc(Long tutorId);
}