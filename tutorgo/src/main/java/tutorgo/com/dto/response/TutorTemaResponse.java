package tutorgo.com.dto.response;

import lombok.Data;

@Data
public class TutorTemaResponse {

    private Long id;
    private Long tutorId;
    private String nombreTutor;
    private Long temaId;
    private String nombreTema;
}
