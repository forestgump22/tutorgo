package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.service.NotificacionService;

import java.util.List;

@Controller
@RequestMapping("/notificaciones")
@RequiredArgsConstructor
@Slf4j
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping("/mis-notificaciones")
    @ResponseBody
    public ResponseEntity<List<NotificacionResponse>> getMisNotificaciones(Authentication authentication) {
        String email = authentication.getName();
        List<NotificacionResponse> notificaciones = notificacionService.getMisNotificaciones(email);

        if (notificaciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(notificaciones);
    }

    // Endpoints de WebSocket
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public String testWebSocket(String mensaje) {
        log.info("Mensaje recibido por WebSocket: {}", mensaje);
        return "Respuesta del servidor: " + mensaje;
    }

    @MessageMapping("/notificacion-recibida")
    public void notificacionRecibida(NotificacionResponse notificacion) {
        log.info("Cliente reconoció recepción de notificación ID: {}", notificacion.getId());
    }
}