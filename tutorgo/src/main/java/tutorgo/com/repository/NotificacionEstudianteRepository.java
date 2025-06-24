// src/main/java/tutorgo/com/repository/NotificacionEstudianteRepository.java
package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.NotificacionEstudiante;

import java.util.List; // Importar

@Repository
public interface NotificacionEstudianteRepository extends JpaRepository<NotificacionEstudiante, Long> {

    List<NotificacionEstudiante> findByEstudianteOrderByFechaCreacionDesc(Estudiante estudiante);
}