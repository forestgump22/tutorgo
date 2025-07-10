package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.EnlaceSesion;

import java.util.List;

@Repository
public interface EnlaceSesionRepository extends JpaRepository<EnlaceSesion, Long> {

    // Buscar enlace por sesión
    List<EnlaceSesion> findBySesionId(Long sesionId);

    //Contrar enlaces por sesión
    long countBySesionId(Long sesionId);
}