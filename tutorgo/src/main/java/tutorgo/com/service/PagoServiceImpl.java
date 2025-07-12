package tutorgo.com.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.ConfirmarPagoRequest;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.enums.MetodoPagoEnum;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements PagoService {
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    private final UserRepository userRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;
    private final SesionRepository sesionRepository;
    private final PagoRepository pagoRepository;
    private final DisponibilidadRepository disponibilidadRepository;
    private final PagoMapper pagoMapper;
    // private final NotificacionSenderService notificacionSenderService; // Comentado temporalmente

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

        System.out.println("Token recibido: " + request.getToken());
        System.out.println("MetodoPago recibido: " + request.getMetodoPago());

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

        if (request.getToken() == null || request.getToken().isEmpty()) {
            throw new BadRequestException("Token de Stripe no proporcionado.");
        }

        boolean pagoAprobado = procesarPagoConStripe(request.getToken(), montoTotal);
        if (!pagoAprobado) {
            throw new BadRequestException("El pago fue rechazado por Stripe.");
        }

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

    @Override
    @Transactional
    public PagoResponse crearPagoPendiente(String alumnoEmail, Long sesionId) {
        User userAlumno = userRepository.findByEmail(alumnoEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario alumno no encontrado: " + alumnoEmail));
        Estudiante alumno = estudianteRepository.findByUser(userAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de estudiante no encontrado para el usuario: " + alumnoEmail));

        Sesion sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada con ID: " + sesionId));

        if (!Objects.equals(sesion.getEstudiante().getId(), alumno.getId())) {
            throw new ForbiddenException("No tienes permiso para crear un pago para esta sesión.");
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
        pago.setMetodoPago(MetodoPagoEnum.TARJETA_CREDITO); // Default method
        pago.setTipoEstado(EstadoPagoEnum.PENDIENTE);
        Pago pagoGuardado = pagoRepository.save(pago);

        PagoResponse pagoDto = pagoMapper.toPagoResponse(pagoGuardado);
        if (pagoDto != null) {
            pagoDto.setSesionId(sesion.getId());
        }
        return pagoDto;
    }

    private boolean procesarPagoConStripe(String token, BigDecimal monto) {
        Stripe.apiKey = stripeSecretKey;

        try {
            Map<String, Object> chargeParams = new HashMap<>();
            chargeParams.put("amount", monto.multiply(BigDecimal.valueOf(100)).intValue()); // en centavos
            chargeParams.put("currency", "usd");
            chargeParams.put("source", token);
            chargeParams.put("description", "Pago de sesión en TutorGo");

            Charge charge = Charge.create(chargeParams);
            return "succeeded".equals(charge.getStatus());

        } catch (StripeException e) {
            e.printStackTrace();
            return false;
        }
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

    @Override
    public List<PagoResponse> obtenerHistorialTransacciones(String userEmail) {
        return userRepository.findByEmail(userEmail).map(u -> {
            if (u.getStudentProfile() != null) {
                return pagoRepository.findByEstudianteIdWithDetails(u.getStudentProfile().getId())
                        .stream().map(pagoMapper::toPagoResponse).collect(Collectors.toList());
            } else if (u.getTutorProfile() != null) {
                return pagoRepository.findByTutorIdWithDetails(u.getTutorProfile().getId())
                        .stream().map(pagoMapper::toPagoResponse).collect(Collectors.toList());
            }
            return List.<PagoResponse>of();
        }).orElse(List.of());
    }

}