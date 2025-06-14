package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Resena;

import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    Optional<Resena> findBySesionId(Long sesionId);

    boolean existsBySesionId(Long sesionId);
}
