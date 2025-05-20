package tutorgo.com.service;

import org.springframework.data.domain.Pageable; // Importar
import tutorgo.com.dto.request.ConfirmarPagoRequest;
import tutorgo.com.dto.response.PagedResponse; // Importar
import tutorgo.com.dto.response.PagoResponse;

public interface PagoService {
    PagoResponse procesarPagoYConfirmarSesion(String alumnoEmail, ConfirmarPagoRequest request);

}