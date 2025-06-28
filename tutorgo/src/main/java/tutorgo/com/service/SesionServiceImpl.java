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
        // ... (obtener alumno y tutor se mantiene igual)
        Estudiante alumno = estudianteRepository.findByUserEmail(alumnoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado"));
        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new ResourceNotFoundException("Tutor no encontrado con ID: " + request.getTutorId()));

        LocalDateTime horaInicialDateTime = LocalDateTime.of(request.getFecha(), request.getHoraInicio());
        LocalDateTime horaFinalDateTime = LocalDateTime.of(request.getFecha(), request.getHoraFinal());

        // Validaciones básicas
        if (horaFinalDateTime.isBefore(horaInicialDateTime) || horaFinalDateTime.equals(horaInicialDateTime)) {
            throw new BadRequestException("La hora de finalización debe ser posterior a la hora de inicio.");
        }
        if (horaInicialDateTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("No se pueden reservar tutorías en el pasado.");
        }

        // ***** VALIDACIÓN CLAVE: El horario solicitado debe estar dentro de un bloque de disponibilidad *****
        List<Disponibilidad> disponibilidadesQueCubren = disponibilidadRepository
                .findDisponibilidadQueEnvuelveElSlot(
                        tutor.getId(),
                        request.getFecha(),
                        horaInicialDateTime,
                        horaFinalDateTime
                );

        if (disponibilidadesQueCubren.isEmpty()) {
            throw new BadRequestException("El horario solicitado no está dentro de la disponibilidad del tutor.");
        }
        // Fin de la validación de disponibilidad

        // ... (Verificar solapamiento con otras sesiones se mantiene igual)
        List<Sesion> sesionesSolapadas = sesionRepository
                .findSesionesSolapadasParaTutor(tutor.getId(), request.getFecha(), horaInicialDateTime, horaFinalDateTime);
        if (!sesionesSolapadas.isEmpty()) {
            throw new BadRequestException("El horario seleccionado ya no está disponible o está ocupado.");
        }

        // ... (Verificar solapamiento para el alumno se mantiene igual)

        // Crear y guardar la nueva sesión
        Sesion nuevaSesion = new Sesion();
        nuevaSesion.setEstudiante(alumno);
        nuevaSesion.setTutor(tutor);
        nuevaSesion.setFecha(request.getFecha());
        nuevaSesion.setHoraInicial(horaInicialDateTime);
        nuevaSesion.setHoraFinal(horaFinalDateTime);
        nuevaSesion.setTipoEstado(EstadoSesionEnum.PENDIENTE);

        Sesion sesionGuardada = sesionRepository.save(nuevaSesion);

        return sesionMapper.toSesionResponse(sesionGuardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SesionResponse> getSesionesByAlumnoEmail(String alumnoEmail) {
        List<Sesion> sesiones = sesionRepository.findByEstudiante_User_EmailOrderByFechaAscHoraInicialAsc(alumnoEmail);
        return sesionMapper.toSesionResponseList(sesiones);
    }


    @Override
    @Transactional(readOnly = true)
    public List<SesionResponse> getSesionesByTutorEmail(String tutorEmail) {
        List<Sesion> sesiones = sesionRepository.findByTutor_User_EmailOrderByFechaAscHoraInicialAsc(tutorEmail);
        return sesionMapper.toSesionResponseList(sesiones);
    }
}