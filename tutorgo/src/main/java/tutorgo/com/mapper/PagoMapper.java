package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Pago;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;

import java.math.BigDecimal;

@Component
public class PagoMapper {

    public PagoResponse toPagoResponse(Pago pago) {
        if (pago == null) {
            return null;
        }
        PagoResponse response = new PagoResponse();
        response.setId(pago.getId());

        if (pago.getTutor() != null) {
            response.setTutorId(pago.getTutor().getId());
        }
        if (pago.getEstudiante() != null) {
            response.setEstudianteId(pago.getEstudiante().getId());
        }

        response.setMonto(pago.getMonto());
        response.setComisionPlataforma(pago.getComisionPlataforma());
        response.setMetodoPago(pago.getMetodoPago());
        response.setTipoEstado(pago.getTipoEstado());
        response.setFechaPago(null); // Cambia esto si tienes el campo
        response.setDescripcion("Pago por sesión o servicio");

        return response;
    }

}