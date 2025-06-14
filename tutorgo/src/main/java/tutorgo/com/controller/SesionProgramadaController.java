package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.response.SesionProgramadaResponseDTO;
import tutorgo.com.service.SesionProgramadaService;

@RestController
@RequestMapping("/sesiones/programada")
@RequiredArgsConstructor
public class SesionProgramadaController {

    //H12
    private final SesionProgramadaService sesionProgramadaService;

    @GetMapping("/mi-sesion")
    public ResponseEntity<SesionProgramadaResponseDTO> obtenerMiSesionProgramada() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String emailAutenticado = obtenerEmailAutenticado(authentication);

        SesionProgramadaResponseDTO respuesta = sesionProgramadaService.obtenerSesionProgramadaDelEstudianteAutenticado(emailAutenticado);
        return ResponseEntity.ok(respuesta);
    }

    private String obtenerEmailAutenticado(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Usuario no autenticado.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        } else {
            return principal.toString();
        }
    }
}
