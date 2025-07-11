package tutorgo.com.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TutorTemaRequest {

    @NotNull(message = "El ID del tutor es obligatorio")
    private Long tutorId;

    @NotNull(message = "El ID del tema es obligatorio")
    private Long temaId;
}
