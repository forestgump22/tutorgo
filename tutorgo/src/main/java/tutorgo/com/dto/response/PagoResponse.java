// src/main/java/tutorgo/com/dto/response/PagoResponse.java
package tutorgo.com.dto.response;

import lombok.Data;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.MetodoPagoEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PagoResponse {
    private Long id;
    private Long tutorId;
    private Long estudianteId;
    private BigDecimal monto;
    private BigDecimal comisionPlataforma;
    private MetodoPagoEnum metodoPago;
    private EstadoPagoEnum tipoEstado;
    private Long sesionId;
    private LocalDateTime fechaPago;
    private String descripcion;
    private String nombreTutor;
    private String nombreEstudiante;
}