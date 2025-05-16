package tutorgo.com.dto.response;

import lombok.Data;

@Data
public class TutorSummaryResponse {
    private Long tutorId;
    private String nombreUsuario;
    private String fotoUrlUsuario;
    private String rubro;
    private Float estrellasPromedio;
    private Integer tarifaHora;
}