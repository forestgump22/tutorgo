package tutorgo.com.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final PagoService pagoService; // Inyectar PagoService


    @PostMapping
    public ResponseEntity<ApiResponse> reservarTutoria(@Valid @RequestBody ReservaTutoriaRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        SesionResponse sesionResponse = sesionService.reservarTutoria(alumnoEmail, request);

        // HU8 Escenario 1
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Tu solicitud ha sido enviada. El tutor la confirmará pronto.", sesionResponse));
    }

    // Endpoint para que el alumno vea "Mis solicitudes" (sus sesiones)
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<List<SesionResponse>> getMisSolicitudes() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();
        List<SesionResponse> sesiones = sesionService.getSesionesByAlumnoEmail(alumnoEmail);
        if (sesiones.isEmpty()) {
            return ResponseEntity.noContent().build(); // O 200 OK con lista vacía
        }
        return ResponseEntity.ok(sesiones);
    }

    // Nuevo endpoint para HU10
    @PostMapping("/{sesionId}/pagos") // Ej: POST /api/sesiones/123/pagos
    public ResponseEntity<ApiResponse> confirmarPagoYReservar(
            @PathVariable Long sesionId, // sesionId viene del path
            @Valid @RequestBody ConfirmarPagoRequest pagoDetails) {

        // Asegurarse que el sesionId del path y del body (si lo tuviera) coincidan o usar solo el del path.
        // Aquí ConfirmarPagoRequest también tiene sesionId, podríamos validar que sean iguales.
        // Por simplicidad, si el DTO tiene sesionId, debe ser el mismo.
        if (!sesionId.equals(pagoDetails.getSesionId())) {
            throw new BadRequestException("El ID de la sesión en el path y en el cuerpo de la solicitud no coinciden.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        PagoResponse pagoResponse = pagoService.procesarPagoYConfirmarSesion(alumnoEmail, pagoDetails);

        // HU10 Escenario 1
        return ResponseEntity.ok(new ApiResponse(true, "Pago exitoso. Te esperamos en la tutoría.", pagoResponse));
    }
}