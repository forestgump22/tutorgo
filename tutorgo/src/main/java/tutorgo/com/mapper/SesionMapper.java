package tutorgo.com.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.User;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SesionMapper {

    private final EnlaceSesionMapper enlaceSesionMapper;

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
        if (sesion.getEnlaces() != null && !sesion.getEnlaces().isEmpty()) {
            response.setEnlaces(
                    sesion.getEnlaces().stream()
                            .map(enlaceSesionMapper::toDTO) // Reutilizamos el EnlaceSesionMapper
                            .collect(Collectors.toList())
            );
        } else {
            response.setEnlaces(Collections.emptyList()); // Asegurarse de que no sea nulo
        }
        response.setHoraInicial(sesion.getHoraInicial());
        response.setHoraFinal(sesion.getHoraFinal());
        response.setTipoEstado(sesion.getTipoEstado());
        response.setFueCalificada(sesion.getResena() != null);
        return response;
    }

    public List<SesionResponse> toSesionResponseList(List<Sesion> sesiones) {
        if (sesiones == null) {
            return Collections.emptyList();
        }
        return sesiones.stream()
                .map(this::toSesionResponse)
                .collect(Collectors.toList());
    }
}