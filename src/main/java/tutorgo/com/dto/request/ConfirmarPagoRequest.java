package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tutorgo.com.enums.MetodoPagoEnum;

@Data
public class ConfirmarPagoRequest {

    @NotNull(message = "El ID de la sesión es obligatorio")
    private Long sesionId;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPagoEnum metodoPago;

    private String token;
}
