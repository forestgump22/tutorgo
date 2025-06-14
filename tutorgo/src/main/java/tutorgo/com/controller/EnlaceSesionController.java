package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.request.EnlaceSesionRequestDTO;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;
import tutorgo.com.service.EnlaceSesionService;

import java.util.List;

import static tutorgo.com.security.SecurityUtil.extractUserEmail;


@RestController
@RequestMapping("/sesiones/{sesionId}/enlaces")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TUTOR')")
public class EnlaceSesionController {

    //H11
    private final EnlaceSesionService enlaceSesionService;

    @PostMapping
    public ResponseEntity<List<EnlaceSesionResponseDTO>> guardarEnlaces(
            @PathVariable Long sesionId,
            @RequestBody List<EnlaceSesionRequestDTO> enlacesDTO,
            Authentication authentication) {

        String emailTutor = extractUserEmail(authentication);
        List<EnlaceSesionResponseDTO> guardados = enlaceSesionService.guardarEnlaces(sesionId, enlacesDTO, emailTutor);
        return ResponseEntity.ok(guardados);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminarEnlace(
            @PathVariable Long id,
            Authentication authentication) {

        String emailTutor = extractUserEmail(authentication);
        enlaceSesionService.eliminarEnlacePorId(id, emailTutor);
        return ResponseEntity.ok("Enlace eliminado correctamente");
    }




}