package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.ReservaTutoriaRequest;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.SesionMapper;
import tutorgo.com.model.*; // Importar Estudiante, Tutor, User, Sesion, Disponibilidad
import tutorgo.com.repository.*; // Importar los repositorios necesarios

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SesionServiceImpl implements SesionService {

    private final UserRepository userRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;
    private final SesionRepository sesionRepository;
    private final DisponibilidadRepository disponibilidadRepository; // Para verificar disponibilidad
    private final SesionMapper sesionMapper;

    @Override
    @Transactional
    public SesionResponse reservarTutoria(String alumnoEmail, ReservaTutoriaRequest request) {
        User userAlumno = userRepository.findByEmail(alumnoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado: " + alumnoEmail));
        Estudiante alumno = estudianteRepository.findByUser(userAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para el usuario: " + alumnoEmail));

        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new ResourceNotFoundException("Tutor no encontrado con ID: " + request.getTutorId()));

        LocalDateTime horaInicialDateTime = LocalDateTime.of(request.getFecha(), request.getHoraInicio());
        LocalDateTime horaFinalDateTime = LocalDateTime.of(request.getFecha(), request.getHoraFinal());

        // Validación de horas
        if (horaFinalDateTime.isBefore(horaInicialDateTime) || horaFinalDateTime.equals(horaInicialDateTime)) {
            throw new BadRequestException("La hora de finalización debe ser posterior a la hora de inicio.");
        }
        // Podríamos añadir validación de duración mínima/máxima si fuera necesario.

        // HU8 Escenario 2: Verificar disponibilidad del tutor y si el turno está ocupado
        // Esta es la parte más compleja. Asumiremos una verificación simple por ahora.
        // 1. ¿Tiene el tutor una disponibilidad que cubra este rango?
        List<Disponibilidad> disponibilidades = disponibilidadRepository.findByTutorAndFecha(tutor, request.getFecha());
        boolean tutorDisponible = disponibilidades.stream().anyMatch(d ->
                !horaInicialDateTime.isBefore(d.getHoraInicial()) && // Reserva inicia en o después de la disponibilidad
                        !horaFinalDateTime.isAfter(d.getHoraFinal())       // Reserva termina en o antes de la disponibilidad
        );

        if (!tutorDisponible) {
            throw new BadRequestException("El tutor no está disponible en la fecha y hora seleccionadas.");
        }

        // 2. ¿Tiene el tutor u otro estudiante ya una sesión que se solape con este horario?
        List<Sesion> sesionesSolapadas = sesionRepository
                .findSesionesSolapadasParaTutor(tutor.getId(), request.getFecha(), horaInicialDateTime, horaFinalDateTime);
        if (!sesionesSolapadas.isEmpty()) {
            throw new BadRequestException("El horario seleccionado ya no está disponible o está ocupado.");
        }
        // También podríamos verificar si el propio alumno tiene una sesión solapada.
        List<Sesion> sesionesSolapadasAlumno = sesionRepository
                .findSesionesSolapadasParaEstudiante(alumno.getId(), request.getFecha(), horaInicialDateTime, horaFinalDateTime);
        if (!sesionesSolapadasAlumno.isEmpty()) {
            throw new BadRequestException("Ya tienes una tutoría reservada que se solapa con este horario.");
        }


        Sesion nuevaSesion = new Sesion();
        nuevaSesion.setEstudiante(alumno);
        nuevaSesion.setTutor(tutor);
        nuevaSesion.setFecha(request.getFecha());
        nuevaSesion.setHoraInicial(horaInicialDateTime);
        nuevaSesion.setHoraFinal(horaFinalDateTime);
        nuevaSesion.setTipoEstado(EstadoSesionEnum.PENDIENTE); // Estado inicial

        Sesion sesionGuardada = sesionRepository.save(nuevaSesion);

        // HU8 Escenario 1: Reserva exitosa
        return sesionMapper.toSesionResponse(sesionGuardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SesionResponse> getSesionesByAlumnoEmail(String alumnoEmail) {
        User userAlumno = userRepository.findByEmail(alumnoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado: " + alumnoEmail));
        Estudiante alumno = estudianteRepository.findByUser(userAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para el usuario: " + alumnoEmail));

        // Podríamos querer ordenar por fecha, hora, etc.
        // List<Sesion> sesiones = sesionRepository.findByEstudianteOrderByFechaAscHoraInicialAsc(alumno);
        List<Sesion> sesiones = sesionRepository.findByEstudianteIdOrderByFechaAscHoraInicialAsc(alumno.getId());
        return sesionMapper.toSesionResponseList(sesiones);
    }
}