package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.User;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SesionMapper {

    public SesionResponse toSesionResponse(Sesion sesion) {
        if (sesion == null) {
            return null;
        }
        SesionResponse response = new SesionResponse();
        response.setId(sesion.getId());

        if (sesion.getTutor() != null) {
            response.setTutorId(sesion.getTutor().getId());
            User tutorUser = sesion.getTutor().getUser();
            if (tutorUser != null) {
                response.setNombreTutor(tutorUser.getNombre());
            }
        }

        if (sesion.getEstudiante() != null) {
            response.setEstudianteId(sesion.getEstudiante().getId());
            User estudianteUser = sesion.getEstudiante().getUser();
            if (estudianteUser != null) {
                response.setNombreEstudiante(estudianteUser.getNombre());
            }
        }

        response.setFecha(sesion.getFecha());
        response.setHoraInicial(sesion.getHoraInicial());
        response.setHoraFinal(sesion.getHoraFinal());
        response.setTipoEstado(sesion.getTipoEstado());

        return response;
    }

    public List<SesionResponse> toSesionResponseList(List<Sesion> sesiones) {
        if (sesiones == null) {
            return List.of();
        }
        return sesiones.stream()
                .map(this::toSesionResponse)
                .collect(Collectors.toList());
    }
}