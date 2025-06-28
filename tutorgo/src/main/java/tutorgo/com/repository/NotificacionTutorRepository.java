package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.NotificacionTutor;
import tutorgo.com.model.Tutor;

import java.util.List;

@Repository
public interface NotificacionTutorRepository extends JpaRepository<NotificacionTutor, Long> {

    // (Opcional pero recomendado) Método para buscar notificaciones por tutor
    // Esto será útil si en el futuro creas una página para que los tutores vean sus notificaciones.
    List<NotificacionTutor> findByTutorOrderByFechaCreacionDesc(Tutor tutor);
}