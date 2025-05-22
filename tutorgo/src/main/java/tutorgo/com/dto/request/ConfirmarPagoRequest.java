package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tutorgo.com.enums.MetodoPagoEnum; // Asegúrate que este enum exista

@Data
public class ConfirmarPagoRequest {

    @NotNull(message = "El ID de la sesión es obligatorio")
    private Long sesionId;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPagoEnum metodoPago;

    // Podríamos añadir aquí campos simulados de tarjeta si quisiéramos que el DTO los llevara,
    // pero como no los vamos a procesar/validar realmente, mantenerlo simple es mejor.
    // El frontend se encargaría de recolectar los detalles reales de la tarjeta.
}