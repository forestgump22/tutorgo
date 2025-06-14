package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.ResenaRequestDTO;
import tutorgo.com.dto.response.ResenaResponseDTO;
import tutorgo.com.service.ResenaService;

import static tutorgo.com.security.SecurityUtil.extractUserEmail;


@RestController
@RequestMapping("/resenas")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ESTUDIANTE')") // Solo estudiantes pueden calificar
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping("/sesion/{sesionId}")
    public ResponseEntity<ResenaResponseDTO> crearResena(
            @PathVariable Long sesionId,
            @RequestBody ResenaRequestDTO requestDTO,
            Authentication authentication) {

        String emailEstudiante = extractUserEmail(authentication);
        ResenaResponseDTO response = resenaService.crearResena(sesionId, requestDTO, emailEstudiante);
        return ResponseEntity.ok(response);
    }



}
