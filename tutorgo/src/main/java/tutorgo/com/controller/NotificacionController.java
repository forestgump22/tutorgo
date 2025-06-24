// src/main/java/tutorgo/com/controller/NotificacionController.java
package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.service.NotificacionService;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-notificaciones")
    public ResponseEntity<List<NotificacionResponse>> getMisNotificaciones(Authentication authentication) {
        String email = authentication.getName();
        List<NotificacionResponse> notificaciones = notificacionService.getMisNotificaciones(email);

        if (notificaciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(notificaciones);
    }
}