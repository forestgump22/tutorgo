package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.DisponibilidadRequest;
import tutorgo.com.dto.response.DisponibilidadResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException; // Nueva excepción para permisos
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.DisponibilidadMapper;
import tutorgo.com.model.Disponibilidad;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.DisponibilidadRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.repository.UserRepository;
import tutorgo.com.repository.SesionRepository; // Para verificar si hay sesiones reservadas

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DisponibilidadServiceImpl implements DisponibilidadService {

    private final UserRepository userRepository;
    private final TutorRepository tutorRepository;
    private final DisponibilidadRepository disponibilidadRepository;
    private final SesionRepository sesionRepository; // Para validaciones al actualizar/borrar
    private final DisponibilidadMapper disponibilidadMapper;

    @Override
    @Transactional
    public DisponibilidadResponse addDisponibilidad(String tutorEmail, DisponibilidadRequest request) {
        User userTutor = userRepository.findByEmail(tutorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario tutor no encontrado: " + tutorEmail));
        Tutor tutor = tutorRepository.findByUser(userTutor)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de tutor no encontrado para el usuario: " + tutorEmail));

        LocalDateTime horaInicialDateTime = LocalDateTime.of(request.getFecha(), request.getHoraInicio());
        LocalDateTime horaFinalDateTime = LocalDateTime.of(request.getFecha(), request.getHoraFinal());

        // HU9 Escenario 3: Registro fallido (datos incorrectos)
        if (horaFinalDateTime.isBefore(horaInicialDateTime) || horaFinalDateTime.equals(horaInicialDateTime)) {
            throw new BadRequestException("La hora de finalización debe ser posterior a la hora de inicio.");
        }
        // Podríamos añadir una duración mínima, ej. 30 minutos.
        // if (java.time.Duration.between(horaInicialDateTime, horaFinalDateTime).toMinutes() < 30) {
        //     throw new BadRequestException("La duración mínima de la disponibilidad es de 30 minutos.");
        // }

        // Validación de solapamiento de disponibilidad (opcional pero recomendada)
        List<Disponibilidad> disponibilidadesSolapadas = disponibilidadRepository
                .findDisponibilidadesSolapadas(tutor.getId(), request.getFecha(), horaInicialDateTime, horaFinalDateTime);
        if (!disponibilidadesSolapadas.isEmpty()) {
            throw new BadRequestException("La nueva disponibilidad se solapa con una existente.");
        }

        Disponibilidad nuevaDisponibilidad = new Disponibilidad();
        nuevaDisponibilidad.setTutor(tutor);
        nuevaDisponibilidad.setFecha(request.getFecha());
        nuevaDisponibilidad.setHoraInicial(horaInicialDateTime);
        nuevaDisponibilidad.setHoraFinal(horaFinalDateTime);

        Disponibilidad guardada = disponibilidadRepository.save(nuevaDisponibilidad);

        // HU9 Escenario 1: Registro de disponibilidad
        return disponibilidadMapper.toDisponibilidadResponse(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisponibilidadResponse> getDisponibilidadesByTutor(String tutorEmail) {
        User userTutor = userRepository.findByEmail(tutorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario tutor no encontrado: " + tutorEmail));
        Tutor tutor = tutorRepository.findByUser(userTutor)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de tutor no encontrado para el usuario: " + tutorEmail));

        List<Disponibilidad> disponibilidades = disponibilidadRepository.findByTutorOrderByFechaAscHoraInicialAsc(tutor);
        return disponibilidadMapper.toDisponibilidadResponseList(disponibilidades);
    }

    @Override
    @Transactional
    public DisponibilidadResponse updateDisponibilidad(String tutorEmail, Long disponibilidadId, DisponibilidadRequest request) {
        User userTutor = userRepository.findByEmail(tutorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario tutor no encontrado: " + tutorEmail));
        Tutor tutor = tutorRepository.findByUser(userTutor)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de tutor no encontrado para el usuario: " + tutorEmail));

        Disponibilidad disponibilidad = disponibilidadRepository.findById(disponibilidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad no encontrada con ID: " + disponibilidadId));

        // Verificar que la disponibilidad pertenezca al tutor autenticado
        if (!Objects.equals(disponibilidad.getTutor().getId(), tutor.getId())) {
            throw new ForbiddenException("No tienes permiso para modificar esta disponibilidad.");
        }

        // No permitir modificar disponibilidades si ya tienen sesiones reservadas/confirmadas en ese rango
        // Esta validación es importante para evitar inconsistencias.
        // Contar sesiones activas dentro del rango ORIGINAL de la disponibilidad
        long sesionesActivas = sesionRepository.countSesionesActivasEnRango(
                disponibilidad.getTutor().getId(),
                disponibilidad.getFecha(),
                disponibilidad.getHoraInicial(),
                disponibilidad.getHoraFinal()
        );
        if (sesionesActivas > 0) {
            throw new BadRequestException("No se puede modificar la disponibilidad porque ya tiene sesiones reservadas o confirmadas en este horario.");
        }


        LocalDateTime nuevaHoraInicial = LocalDateTime.of(request.getFecha(), request.getHoraInicio());
        LocalDateTime nuevaHoraFinal = LocalDateTime.of(request.getFecha(), request.getHoraFinal());

        if (nuevaHoraFinal.isBefore(nuevaHoraInicial) || nuevaHoraFinal.equals(nuevaHoraInicial)) {
            throw new BadRequestException("La hora de finalización debe ser posterior a la hora de inicio.");
        }

        // Validación de solapamiento, excluyendo la disponibilidad actual que se está modificando
        List<Disponibilidad> disponibilidadesSolapadas = disponibilidadRepository
                .findDisponibilidadesSolapadasExcluyendoActual(tutor.getId(), request.getFecha(), nuevaHoraInicial, nuevaHoraFinal, disponibilidadId);
        if (!disponibilidadesSolapadas.isEmpty()) {
            throw new BadRequestException("La disponibilidad actualizada se solapa con otra existente.");
        }

        disponibilidad.setFecha(request.getFecha());
        disponibilidad.setHoraInicial(nuevaHoraInicial);
        disponibilidad.setHoraFinal(nuevaHoraFinal);

        Disponibilidad actualizada = disponibilidadRepository.save(disponibilidad);

        // HU9 Escenario 2: Actualización de disponibilidad
        return disponibilidadMapper.toDisponibilidadResponse(actualizada);
    }

    @Override
    @Transactional
    public void deleteDisponibilidad(String tutorEmail, Long disponibilidadId) {
        User userTutor = userRepository.findByEmail(tutorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario tutor no encontrado: " + tutorEmail));
        Tutor tutor = tutorRepository.findByUser(userTutor)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de tutor no encontrado para el usuario: " + tutorEmail));

        Disponibilidad disponibilidad = disponibilidadRepository.findById(disponibilidadId)
                .orElseThrow(() -> new ResourceNotFoundException("Disponibilidad no encontrada con ID: " + disponibilidadId));

        if (!Objects.equals(disponibilidad.getTutor().getId(), tutor.getId())) {
            throw new ForbiddenException("No tienes permiso para eliminar esta disponibilidad.");
        }

        // No permitir eliminar disponibilidades si ya tienen sesiones reservadas/confirmadas
        long sesionesActivas = sesionRepository.countSesionesActivasEnRango(
                disponibilidad.getTutor().getId(),
                disponibilidad.getFecha(),
                disponibilidad.getHoraInicial(),
                disponibilidad.getHoraFinal()
        );
        if (sesionesActivas > 0) {
            throw new BadRequestException("No se puede eliminar la disponibilidad porque ya tiene sesiones reservadas o confirmadas en este horario.");
        }

        disponibilidadRepository.delete(disponibilidad);
    }
}