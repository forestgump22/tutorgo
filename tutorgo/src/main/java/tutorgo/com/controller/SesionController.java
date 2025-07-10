package tutorgo.com.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.ReservaTutoriaRequest;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.service.SesionService;

import tutorgo.com.dto.request.ConfirmarPagoRequest; // Nueva importación
import tutorgo.com.service.PagoService;

import java.util.List;

@RestController
@RequestMapping("/sesiones")
@RequiredArgsConstructor
public class SesionController {

    private final SesionService sesionService;
    private final PagoService pagoService;


    @PostMapping
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<ApiResponse> reservarTutoria(@Valid @RequestBody ReservaTutoriaRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        SesionResponse sesionResponse = sesionService.reservarTutoria(alumnoEmail, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Tu solicitud ha sido enviada. El tutor la confirmará pronto.", sesionResponse));
    }

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<List<SesionResponse>> getMisSolicitudes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<SesionResponse> sesiones = sesionService.getSesionesByAlumnoEmail(alumnoEmail);
        if (sesiones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(sesiones);
    }

    @GetMapping("/mis-clases")
    @PreAuthorize("hasRole('TUTOR')")
    public ResponseEntity<List<SesionResponse>> getMisClases() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String tutorEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<SesionResponse> sesiones = sesionService.getSesionesByTutorEmail(tutorEmail);
        if (sesiones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(sesiones);
    }

    @PostMapping("/{sesionId}/pagos")
    @PreAuthorize("hasRole('ESTUDIANTE')")
    public ResponseEntity<ApiResponse> confirmarPagoYReservar(
            @PathVariable Long sesionId,
            @Valid @RequestBody ConfirmarPagoRequest pagoDetails) {

        if (!sesionId.equals(pagoDetails.getSesionId())) {
            throw new BadRequestException("El ID de la sesión en el path y en el cuerpo de la solicitud no coinciden.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        PagoResponse pagoResponse = pagoService.procesarPagoYConfirmarSesion(alumnoEmail, pagoDetails);

        return ResponseEntity.ok(new ApiResponse(true, "Pago exitoso. Te esperamos en la tutoría.", pagoResponse));
    }
}