package tutorgo.com.dto.response;

import lombok.Data;

@Data
public class TutorSummaryResponse {
    private Long tutorId;
    private String nombreUsuario;
    private String fotoUrlUsuario;
    private String temaPrincipal; // Cambiado de rubro a temaPrincipal
    private Float estrellasPromedio;
    private Integer tarifaHora;
}