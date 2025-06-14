package tutorgo.com.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tutorgo.com.model.Disponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tutorgo.com.model.Tutor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {
    List<Disponibilidad> findByTutorAndFecha(Tutor tutor, LocalDate fecha);

    List<Disponibilidad> findByTutorOrderByFechaAscHoraInicialAsc(Tutor tutor);

    @Query("SELECT d FROM Disponibilidad d WHERE d.tutor.id = :tutorId AND d.fecha = :fecha " +
            "AND d.horaInicial < :horaFinalNueva AND d.horaFinal > :horaInicialNueva")
    List<Disponibilidad> findDisponibilidadesSolapadas(@Param("tutorId") Long tutorId,
                                                       @Param("fecha") LocalDate fecha,
                                                       @Param("horaInicialNueva") LocalDateTime horaInicialNueva,
                                                       @Param("horaFinalNueva") LocalDateTime horaFinalNueva);

    @Query("SELECT d FROM Disponibilidad d WHERE d.tutor.id = :tutorId AND d.id <> :disponibilidadIdExcluir AND d.fecha = :fecha " +
            "AND d.horaInicial < :horaFinalNueva AND d.horaFinal > :horaInicialNueva")
    List<Disponibilidad> findDisponibilidadesSolapadasExcluyendoActual(@Param("tutorId") Long tutorId,
                                                                       @Param("fecha") LocalDate fecha,
                                                                       @Param("horaInicialNueva") LocalDateTime horaInicialNueva,
                                                                       @Param("horaFinalNueva") LocalDateTime horaFinalNueva,
                                                                       @Param("disponibilidadIdExcluir") Long disponibilidadIdExcluir);


    @Query("SELECT d FROM Disponibilidad d WHERE d.tutor.id = :tutorId AND d.fecha = :fecha " +
            "AND d.horaInicial <= :horaInicioSesion AND d.horaFinal >= :horaFinSesion")
    List<Disponibilidad> findDisponibilidadQueEnvuelveElSlot(@Param("tutorId") Long tutorId,
                                                             @Param("fecha") LocalDate fecha,
                                                             @Param("horaInicioSesion") LocalDateTime horaInicioSesion,
                                                             @Param("horaFinSesion") LocalDateTime horaFinSesion);
}
