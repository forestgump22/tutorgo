package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.CentroEstudio;

@Repository
public interface CentroEstudioRepository extends JpaRepository<CentroEstudio, Long> {
}