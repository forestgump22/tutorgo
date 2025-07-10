package tutorgo.com.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class TemaResponse {

    private Long id;
    private String nombre;
    private String descripcion;
    private Long temaPadreId;
    private List<TemaResponse> subtemas;
}
