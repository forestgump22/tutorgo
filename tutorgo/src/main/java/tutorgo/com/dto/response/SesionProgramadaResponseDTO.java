package tutorgo.com.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SesionProgramadaResponseDTO {
    private Long sesionId;
    private boolean enlaceDisponible;
    private String mensaje;
    private List<EnlaceSesionResponseDTO> enlaces;
}