package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.service.PagoService;
import tutorgo.com.model.User;
import tutorgo.com.repository.UserRepository;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Tutor;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.TutorRepository;

import java.util.List;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class PagoController {
    private final PagoService pagoService;
    private final UserRepository userRepository;
    private final EstudianteRepository estudianteRepository;
    private final TutorRepository tutorRepository;

    @GetMapping("/historial")
    public ResponseEntity<?> getHistorialTransacciones() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("No autorizado");
        }
        String tipoUsuario = "";
        if (estudianteRepository.findByUser(user).isPresent()) {
            tipoUsuario = "estudiante";
        } else if (tutorRepository.findByUser(user).isPresent()) {
            tipoUsuario = "tutor";
        } else {
            return ResponseEntity.status(403).body("Usuario no tiene rol válido");
        }
        try {
            List<PagoResponse> historial = pagoService.obtenerHistorialTransacciones(userEmail);
            if (historial.isEmpty()) {
                return ResponseEntity.ok().body("Aún no tienes transacciones registradas");
            }
            return ResponseEntity.ok().body(historial);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("No se pudo cargar tu historial de pagos. Intenta nuevamente más tarde");
        }
    }
}

