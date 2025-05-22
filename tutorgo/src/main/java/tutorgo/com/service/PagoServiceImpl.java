package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.ConfirmarPagoRequest;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.enums.RoleName;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.PagoMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {

    private final UserRepository userRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository; // Necesario para obtener el perfil del tutor
    private final SesionRepository sesionRepository;
    private final PagoRepository pagoRepository;
    private final DisponibilidadRepository disponibilidadRepository;
    private final PagoMapper pagoMapper;

    private static final BigDecimal PORCENTAJE_COMISION_PLATAFORMA = new BigDecimal("0.10");

    @Override
    @Transactional
    public PagoResponse procesarPagoYConfirmarSesion(String alumnoEmail, ConfirmarPagoRequest request) {
        // ... (implementación existente de procesarPagoYConfirmarSesion)
        User userAlumno = userRepository.findByEmail(alumnoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado: " + alumnoEmail));
        Estudiante alumno = estudianteRepository.findByUser(userAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para el usuario: " + alumnoEmail));

        Sesion sesion = sesionRepository.findById(request.getSesionId())
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada con ID: " + request.getSesionId()));

        if (!Objects.equals(sesion.getEstudiante().getId(), alumno.getId())) {
            throw new ForbiddenException("No tienes permiso para pagar esta sesión.");
        }

        if (sesion.getTipoEstado() != EstadoSesionEnum.PENDIENTE) {
            throw new BadRequestException("Esta sesión no está pendiente de pago o ya ha sido procesada.");
        }

        Tutor tutor = sesion.getTutor();
        if (tutor == null) {
            throw new IllegalStateException("La sesión con ID " + sesion.getId() + " no tiene un tutor asignado.");
        }

        long duracionMinutos = Duration.between(sesion.getHoraInicial(), sesion.getHoraFinal()).toMinutes();
        if (duracionMinutos <= 0) {
            throw new BadRequestException("La duración de la sesión es inválida.");
        }
        BigDecimal tarifaPorMinuto = BigDecimal.valueOf(tutor.getTarifaHora()).divide(BigDecimal.valueOf(60), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal montoTotal = tarifaPorMinuto.multiply(BigDecimal.valueOf(duracionMinutos));
        BigDecimal comision = montoTotal.multiply(PORCENTAJE_COMISION_PLATAFORMA).setScale(2, BigDecimal.ROUND_HALF_UP);

        Pago pago = new Pago();
        pago.setEstudiante(alumno);
        pago.setTutor(tutor);
        pago.setMonto(montoTotal);
        pago.setComisionPlataforma(comision);
        pago.setMetodoPago(request.getMetodoPago());
        pago.setTipoEstado(EstadoPagoEnum.COMPLETADO);
        Pago pagoGuardado = pagoRepository.save(pago);

        sesion.setTipoEstado(EstadoSesionEnum.CONFIRMADO);
        sesionRepository.save(sesion);

        ajustarDisponibilidadDelTutor(sesion);

        PagoResponse pagoDto = pagoMapper.toPagoResponse(pagoGuardado);
        // Añadir sesionId al DTO si es necesario
        if (pagoDto != null) { // pagoMapper puede devolver null si pagoGuardado es null
            pagoDto.setSesionId(sesion.getId());
        }
        return pagoDto;
    }

    private void ajustarDisponibilidadDelTutor(Sesion sesionConfirmada) {
        // ... (implementación existente de ajustarDisponibilidadDelTutor)
        Tutor tutor = sesionConfirmada.getTutor();
        LocalDateTime inicioSesion = sesionConfirmada.getHoraInicial();
        LocalDateTime finSesion = sesionConfirmada.getHoraFinal();

        List<Disponibilidad> disponibilidadesOriginales = disponibilidadRepository
                .findDisponibilidadQueEnvuelveElSlot(
                        tutor.getId(),
                        sesionConfirmada.getFecha(),
                        inicioSesion,
                        finSesion);

        if (disponibilidadesOriginales.isEmpty()) {
            System.err.println("ADVERTENCIA: No se encontró la disponibilidad original para la sesión ID: " + sesionConfirmada.getId() +
                    ". No se pudo ajustar la disponibilidad del tutor.");
            return;
        }

        Disponibilidad dispOriginal = disponibilidadesOriginales.get(0);

        if (dispOriginal.getHoraInicial().equals(inicioSesion) && dispOriginal.getHoraFinal().equals(finSesion)) {
            disponibilidadRepository.delete(dispOriginal);
        }
        else if (dispOriginal.getHoraInicial().equals(inicioSesion) && finSesion.isBefore(dispOriginal.getHoraFinal())) {
            dispOriginal.setHoraInicial(finSesion);
            disponibilidadRepository.save(dispOriginal);
        }
        else if (inicioSesion.isAfter(dispOriginal.getHoraInicial()) && dispOriginal.getHoraFinal().equals(finSesion)) {
            dispOriginal.setHoraFinal(inicioSesion);
            disponibilidadRepository.save(dispOriginal);
        }
        else if (inicioSesion.isAfter(dispOriginal.getHoraInicial()) && finSesion.isBefore(dispOriginal.getHoraFinal())) {
            LocalDateTime finOriginal = dispOriginal.getHoraFinal();
            dispOriginal.setHoraFinal(inicioSesion);
            disponibilidadRepository.save(dispOriginal);

            Disponibilidad nuevaDispDespues = new Disponibilidad();
            nuevaDispDespues.setTutor(tutor);
            nuevaDispDespues.setFecha(dispOriginal.getFecha());
            nuevaDispDespues.setHoraInicial(finSesion);
            nuevaDispDespues.setHoraFinal(finOriginal);
            disponibilidadRepository.save(nuevaDispDespues);
        } else {
            System.err.println("ADVERTENCIA: Lógica de ajuste de disponibilidad no cubre el caso para sesión ID: " + sesionConfirmada.getId() +
                    " y disponibilidad ID: " + dispOriginal.getId());
        }
    }

}