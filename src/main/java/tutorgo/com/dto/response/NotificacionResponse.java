package tutorgo.com.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tutorgo.com.model.NotificacionEstudiante;
import tutorgo.com.model.NotificacionTutor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponse {
    private Long id;
    private String titulo;
    private String texto;
    private String tipo; // Tipo de notificación como String
    private LocalDateTime fechaCreacion;
    private boolean leida;

    public static NotificacionResponse fromEntity(NotificacionTutor notificacion) {
        return NotificacionResponse.builder()
                .id(notificacion.getId())
                .titulo(notificacion.getTitulo())
                .texto(notificacion.getTexto())
                .tipo(notificacion.getTipo().name())
                .fechaCreacion(notificacion.getFechaCreacion())
                .leida(false) // Por defecto, la notificación es no leída
                .build();
    }

    public static NotificacionResponse fromEntity(NotificacionEstudiante notificacion) {
        return NotificacionResponse.builder()
                .id(notificacion.getId())
                .titulo(notificacion.getTitulo())
                .texto(notificacion.getTexto())
                .tipo(notificacion.getTipo().name())
                .fechaCreacion(notificacion.getFechaCreacion())
                .leida(false) // Por defecto, la notificación es no leída
                .build();
    }
}