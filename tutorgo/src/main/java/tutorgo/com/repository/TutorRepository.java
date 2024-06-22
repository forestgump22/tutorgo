package tutorgo.com.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TutorRepository extends JpaRepository<Tutor, Long> {
    Optional<Tutor> findByUser(User user);
    Optional<Tutor> findByUserId(Long userId);

    // Este se usará cuando la búsqueda esté vacía.
    @Query(value = "SELECT t FROM Tutor t JOIN FETCH t.user u",
            countQuery = "SELECT COUNT(t) FROM Tutor t")
    Page<Tutor> findAllWithUser(Pageable pageable);

    // ***** MÉTODO PARA BÚSQUEDA FILTRADA *****
    // Este se usará SOLO cuando haya un término de búsqueda.
    @Query("SELECT t FROM Tutor t JOIN t.user u " +
            "WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.rubro) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Tutor> searchByQuery(@Param("query") String query, Pageable pageable);

    @Query("SELECT t FROM Tutor t JOIN t.user u WHERE " +
            "(:query IS NULL OR LOWER(u.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.rubro) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:maxPrecio IS NULL OR t.tarifaHora <= :maxPrecio) " +
            "AND (:puntuacion IS NULL OR t.estrellasPromedio >= :puntuacion)")
    Page<Tutor> searchWithFilters(
            @Param("query") String query,
            @Param("maxPrecio") Integer maxPrecio,
            @Param("puntuacion") Float puntuacion,
            Pageable pageable
    );

    @Query("SELECT t FROM Tutor t JOIN t.user u WHERE " +
            "LOWER(u.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(t.rubro) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Tutor> searchByNameOrRubro(@Param("query") String query, Pageable pageable);

    // ***** CONSULTA MODIFICADA: SIN FILTRO DE TEXTO *****
    // Esta consulta solo filtra por precio y puntuación, que son numéricos y no dan error.
    @Query("SELECT t FROM Tutor t JOIN FETCH t.user u WHERE " + // JOIN FETCH para optimizar
            "(:maxPrecio IS NULL OR t.tarifaHora <= :maxPrecio) " +
            "AND (:puntuacion IS NULL OR t.estrellasPromedio >= :puntuacion)")
    List<Tutor> findWithNumericFilters(
            @Param("maxPrecio") Integer maxPrecio,
            @Param("puntuacion") Float puntuacion
    );
}