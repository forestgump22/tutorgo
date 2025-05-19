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
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.service.SesionService;

import java.util.List;

@RestController
@RequestMapping("/sesiones")
@RequiredArgsConstructor
public class SesionController {

    private final SesionService sesionService;

    @PostMapping
    public ResponseEntity<ApiResponse> reservarTutoria(@Valid @RequestBody ReservaTutoriaRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String alumnoEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        SesionResponse sesionResponse = sesionService.reservarTutoria(alumnoEmail, request);

        // HU8 Escenario 1
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(true, "Tu solicitud ha sido enviada. El tutor la confirmará pronto.", sesionResponse));
    }
    

}