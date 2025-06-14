package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UpdateUserProfileRequest {

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String nombre;

    @URL(message = "El formato de la URL de la foto no es válido")
    @Size(max = 255, message = "La URL de la foto no debe exceder los 255 caracteres")
    private String fotoUrl;
}