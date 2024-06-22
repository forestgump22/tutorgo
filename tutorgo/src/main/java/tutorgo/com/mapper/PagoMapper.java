// src/main/java/tutorgo/com/mapper/PagoMapper.java
package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.model.Pago;

@Component
public class PagoMapper {

    public PagoResponse toPagoResponse(Pago pago) {
        if (pago == null) {
            return null;
        }
        PagoResponse response = new PagoResponse();
        response.setId(pago.getId());
        response.setMonto(pago.getMonto());
        response.setComisionPlataforma(pago.getComisionPlataforma());
        response.setMetodoPago(pago.getMetodoPago());
        response.setTipoEstado(pago.getTipoEstado());

        if (pago.getTutor() != null) {
            response.setTutorId(pago.getTutor().getId());
            if (pago.getTutor().getUser() != null) {
                response.setNombreTutor(pago.getTutor().getUser().getNombre());
            }
        }

        if (pago.getEstudiante() != null) {
            response.setEstudianteId(pago.getEstudiante().getId());
            if (pago.getEstudiante().getUser() != null) {
                response.setNombreEstudiante(pago.getEstudiante().getUser().getNombre());
            }
        }

        return response;
    }
}