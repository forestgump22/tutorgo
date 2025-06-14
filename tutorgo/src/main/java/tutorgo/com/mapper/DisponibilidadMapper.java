package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.DisponibilidadResponse;
import tutorgo.com.model.Disponibilidad;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DisponibilidadMapper {

    public DisponibilidadResponse toDisponibilidadResponse(Disponibilidad disponibilidad) {
        if (disponibilidad == null) {
            return null;
        }
        DisponibilidadResponse response = new DisponibilidadResponse();
        response.setId(disponibilidad.getId());
        if (disponibilidad.getTutor() != null) {
            response.setTutorId(disponibilidad.getTutor().getId());
        }
        response.setFecha(disponibilidad.getFecha());
        response.setHoraInicial(disponibilidad.getHoraInicial());
        response.setHoraFinal(disponibilidad.getHoraFinal());
        return response;
    }

    public List<DisponibilidadResponse> toDisponibilidadResponseList(List<Disponibilidad> disponibilidades) {
        if (disponibilidades == null) {
            return List.of();
        }
        return disponibilidades.stream()
                .map(this::toDisponibilidadResponse)
                .collect(Collectors.toList());
    }
}