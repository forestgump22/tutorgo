package tutorgo.com.dto.response;

import lombok.Data;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.MetodoPagoEnum;

import java.math.BigDecimal;

@Data
public class PagoResponse {
    private Long id;
    private Long tutorId;
    private Long estudianteId;
    private BigDecimal monto;
    private BigDecimal comisionPlataforma;
    private MetodoPagoEnum metodoPago;
    private EstadoPagoEnum tipoEstado;
    private Long sesionId; // Para vincular el pago a la sesión en la respuesta
}