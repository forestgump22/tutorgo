package tutorgo.com.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.model.Estudiante; // Si usas findByEstudiante...
import tutorgo.com.model.Sesion;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SesionRepository extends JpaRepository<Sesion, Long> {

    // Consulta para encontrar sesiones que se solapan para un tutor específico
    @Query("SELECT s FROM Sesion s WHERE s.tutor.id = :tutorId AND s.fecha = :fecha " +
            "AND s.horaInicial < :horaFinalReserva AND s.horaFinal > :horaInicialReserva " +
            // Considerar también si el estado es PENDIENTE o CONFIRMADO para el solapamiento
            "AND s.tipoEstado IN (tutorgo.com.enums.EstadoSesionEnum.CONFIRMADO, tutorgo.com.enums.EstadoSesionEnum.PENDIENTE)")
    List<Sesion> findSesionesSolapadasParaTutor(@Param("tutorId") Long tutorId,
                                                @Param("fecha") LocalDate fecha,
                                                @Param("horaInicialReserva") LocalDateTime horaInicialReserva,
                                                @Param("horaFinalReserva") LocalDateTime horaFinalReserva);

    // Para "Mis solicitudes" del alumno
    List<Sesion> findByEstudianteIdOrderByFechaAscHoraInicialAsc(Long estudianteId);

    // --- MÉTODO AÑADIDO ---
    // Consulta para encontrar sesiones que se solapan para un ESTUDIANTE específico
    @Query("SELECT s FROM Sesion s WHERE s.estudiante.id = :estudianteId AND s.fecha = :fecha " +
            "AND s.horaInicial < :horaFinalReserva AND s.horaFinal > :horaInicialReserva " +
            "AND s.tipoEstado IN (tutorgo.com.enums.EstadoSesionEnum.CONFIRMADO, tutorgo.com.enums.EstadoSesionEnum.PENDIENTE)")
    List<Sesion> findSesionesSolapadasParaEstudiante(@Param("estudianteId") Long estudianteId,
                                                     @Param("fecha") LocalDate fecha,
                                                     @Param("horaInicialReserva") LocalDateTime horaInicialReserva,
                                                     @Param("horaFinalReserva") LocalDateTime horaFinalReserva);

    // Si prefieres buscar por la entidad Estudiante en lugar de su ID
    // List<Sesion> findByEstudianteAndFechaAndHoraInicialLessThanAndHoraFinalGreaterThan(
    //    Estudiante estudiante, LocalDate fecha, LocalDateTime horaFinalReserva, LocalDateTime horaInicialReserva
    // );
    @Query("SELECT COUNT(s) FROM Sesion s WHERE s.tutor.id = :tutorId AND s.fecha = :fecha " +
            "AND s.horaInicial < :horaFinalDisp AND s.horaFinal > :horaInicialDisp " +
            "AND s.tipoEstado IN (tutorgo.com.enums.EstadoSesionEnum.PENDIENTE, tutorgo.com.enums.EstadoSesionEnum.CONFIRMADO)")
    long countSesionesActivasEnRango(@Param("tutorId") Long tutorId,
                                     @Param("fecha") LocalDate fecha,
                                     @Param("horaInicialDisp") LocalDateTime horaInicialDisp,
                                     @Param("horaFinalDisp") LocalDateTime horaFinalDisp);


    List<Sesion> findByTipoEstadoAndHoraInicialBetween( // Nombre del método cambiado
                                                        EstadoSesionEnum tipoEstado,
                                                        LocalDateTime horaInicialDesde,
                                                        LocalDateTime horaInicialHasta
    );
}