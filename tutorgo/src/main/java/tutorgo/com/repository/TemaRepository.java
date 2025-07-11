package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Tema;

import java.util.List;

@Repository
public interface TemaRepository extends JpaRepository<Tema, Long> {
    List<Tema> findByTemaPadreIsNull(); // Para obtener los temas raíz
    List<Tema> findByTemaPadreId(Long temaPadreId); // Para obtener subtemas de un tema
}
