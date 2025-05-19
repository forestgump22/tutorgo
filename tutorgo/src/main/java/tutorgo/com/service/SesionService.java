package tutorgo.com.service;

import tutorgo.com.dto.request.ReservaTutoriaRequest;
import tutorgo.com.dto.response.SesionResponse;
import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;


import java.util.List;

public interface SesionService {
    SesionResponse reservarTutoria(String alumnoEmail, ReservaTutoriaRequest request);
//    List<SesionResponse> getSesionesByAlumnoEmail(String alumnoEmail);

}