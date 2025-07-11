package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TemaRequest {

    @NotBlank(message = "El nombre del tema es obligatorio")
    @Size(max = 150, message = "El nombre del tema no puede tener más de 150 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    private String descripcion;

    private Long temaPadreId;
}
