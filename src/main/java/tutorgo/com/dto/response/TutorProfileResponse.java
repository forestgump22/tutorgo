package tutorgo.com.dto.response;

import lombok.Data;

@Data
public class TutorProfileResponse {
    private Long id;
    private String nombreUsuario;
    private String fotoUrlUsuario;
    private Integer tarifaHora;
    private String temaPrincipal; // Cambiado de rubro a temaPrincipal
    private String bio;
    private Float estrellasPromedio;
}