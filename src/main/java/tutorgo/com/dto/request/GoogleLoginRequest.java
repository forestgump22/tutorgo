package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    @NotBlank(message = "El token de Google es obligatorio")
    private String googleToken;
}
