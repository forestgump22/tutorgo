// src/main/java/tutorgo/com/dto/response/NotificacionResponse.java
package tutorgo.com.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponse {
    private Long id;
    private String titulo;
    private String texto;
    private String tipo;
    private LocalDateTime fechaCreacion;
}