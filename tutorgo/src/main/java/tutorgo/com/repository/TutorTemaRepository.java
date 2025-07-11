package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.TutorTema;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorTemaRepository extends JpaRepository<TutorTema, Long> {
    List<TutorTema> findByTutorId(Long tutorId);
    
    // Buscar solo subtemas (temas que tienen padre)
    List<TutorTema> findByTutorIdAndTemaTemaPadreIsNotNull(Long tutorId);
    
    // Buscar el primer tema asignado al tutor (para obtener tema principal)
    Optional<TutorTema> findFirstByTutorId(Long tutorId);
    
    // Verificar si un tutor ya tiene temas asignados
    boolean existsByTutorId(Long tutorId);
    
    // Buscar todos los temas de un tutor que pertenecen a un tema principal específico
    @Query("SELECT tt FROM TutorTema tt WHERE tt.tutor.id = :tutorId AND tt.tema.temaPadre.id = :temaPrincipalId")
    List<TutorTema> findByTutorIdAndTemaPrincipalId(@Param("tutorId") Long tutorId, @Param("temaPrincipalId") Long temaPrincipalId);
}

