package tutorgo.com.repository;

import tutorgo.com.model.Estudiante;
import tutorgo.com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByUser(User user);

    Optional<Estudiante> findByUserId(Long userId);
}