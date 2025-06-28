package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.service.TutorService;
import tutorgo.com.utils.AppConstants;

import tutorgo.com.dto.response.DisponibilidadResponse;
import tutorgo.com.service.DisponibilidadService;
import java.util.List;

@RestController
@RequestMapping("/tutores")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;
    private final DisponibilidadService disponibilidadService;

    @GetMapping
    public ResponseEntity<?> getAllTutores(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "maxPrecio", required = false) Integer maxPrecio,
            @RequestParam(value = "puntuacion", required = false) Float puntuacion,
            @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(value = "size", defaultValue = "9") int size,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY_TUTOR) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION) String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        PagedResponse<TutorSummaryResponse> response = tutorService.getAllTutores(query, maxPrecio, puntuacion, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorProfile(@PathVariable Long id) {
        try {
            TutorProfileResponse response = tutorService.getTutorProfile(id);
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "No se pudo cargar el perfil completo del tutor"));
        }
    }

    @GetMapping("/{tutorId}/disponibilidades")
    @PreAuthorize("isAuthenticated()") // Solo usuarios logueados (estudiantes) pueden verla
    public ResponseEntity<List<DisponibilidadResponse>> getDisponibilidadesDeTutor(@PathVariable Long tutorId) {
        List<DisponibilidadResponse> disponibilidades = disponibilidadService.getDisponibilidadesByTutorId(tutorId);
        if (disponibilidades.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(disponibilidades);
    }

}