package tutorgo.com.dto.response;

import lombok.Data;

@Data
public class TutorProfileResponse {
    private Long id;
    private String nombreUsuario;
    private String fotoUrlUsuario;
    private Integer tarifaHora;
    private String rubro;
    private String bio;
    private Float estrellasPromedio;
}