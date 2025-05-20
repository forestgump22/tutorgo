package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.ReservaTutoriaRequest;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.SesionMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class SesionServiceImpl implements SesionService {

    private final UserRepository userRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;
    private final SesionRepository sesionRepository;
    private final DisponibilidadRepository disponibilidadRepository;
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

        if (horaFinalDateTime.isBefore(horaInicialDateTime) || horaFinalDateTime.equals(horaInicialDateTime)) {
            throw new BadRequestException("La hora de finalización debe ser posterior a la hora de inicio.");
        }

        List<Disponibilidad> disponibilidades = disponibilidadRepository.findByTutorAndFecha(tutor, request.getFecha());
        boolean tutorDisponible = disponibilidades.stream().anyMatch(d ->
                !horaInicialDateTime.isBefore(d.getHoraInicial()) &&
                        !horaFinalDateTime.isAfter(d.getHoraFinal())
        );

        if (!tutorDisponible) {
            throw new BadRequestException("El tutor no está disponible en la fecha y hora seleccionadas.");
        }

        List<Sesion> sesionesSolapadas = sesionRepository
                .findSesionesSolapadasParaTutor(tutor.getId(), request.getFecha(), horaInicialDateTime, horaFinalDateTime);
        if (!sesionesSolapadas.isEmpty()) {
            throw new BadRequestException("El horario seleccionado ya no está disponible o está ocupado.");
        }
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

        return sesionMapper.toSesionResponse(sesionGuardada);
    }

}