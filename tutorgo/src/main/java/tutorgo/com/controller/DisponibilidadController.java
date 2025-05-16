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
import tutorgo.com.dto.request.DisponibilidadRequest;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.dto.response.DisponibilidadResponse;
import tutorgo.com.service.DisponibilidadService;

import java.util.List;

@RestController
@RequestMapping("/tutores/me/disponibilidades")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TUTOR')")
public class DisponibilidadController {

    private final DisponibilidadService disponibilidadService;

    private String getAuthenticatedTutorEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ((UserDetails) authentication.getPrincipal()).getUsername();
    }

    // HU9 Escenario 1: Registro de disponibilidad
    @PostMapping
    public ResponseEntity<ApiResponse> addDisponibilidad(@Valid @RequestBody DisponibilidadRequest request) {
        String tutorEmail = getAuthenticatedTutorEmail();
        DisponibilidadResponse response = disponibilidadService.addDisponibilidad(tutorEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Disponibilidad agregada correctamente.", response));
    }

    @GetMapping
    public ResponseEntity<List<DisponibilidadResponse>> getMisDisponibilidades() {
        String tutorEmail = getAuthenticatedTutorEmail();
        List<DisponibilidadResponse> disponibilidades = disponibilidadService.getDisponibilidadesByTutor(tutorEmail);
        if (disponibilidades.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(disponibilidades);
    }

    // HU9 Escenario 2: Actualización de disponibilidad
    @PutMapping("/{disponibilidadId}")
    public ResponseEntity<ApiResponse> updateDisponibilidad(
            @PathVariable Long disponibilidadId,
            @Valid @RequestBody DisponibilidadRequest request) {
        String tutorEmail = getAuthenticatedTutorEmail();
        DisponibilidadResponse response = disponibilidadService.updateDisponibilidad(tutorEmail, disponibilidadId, request);
        return ResponseEntity.ok(new ApiResponse(true, "Disponibilidad actualizada correctamente.", response));
    }

    @DeleteMapping("/{disponibilidadId}")
    public ResponseEntity<ApiResponse> deleteDisponibilidad(@PathVariable Long disponibilidadId) {
        String tutorEmail = getAuthenticatedTutorEmail();
        disponibilidadService.deleteDisponibilidad(tutorEmail, disponibilidadId);
        return ResponseEntity.ok(new ApiResponse(true, "Disponibilidad eliminada correctamente."));
    }
}