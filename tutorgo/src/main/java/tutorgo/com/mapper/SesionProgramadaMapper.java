package tutorgo.com.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;
import tutorgo.com.dto.response.SesionProgramadaResponseDTO;
import tutorgo.com.model.EnlaceSesion;
import tutorgo.com.model.Sesion;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SesionProgramadaMapper {

    private final EnlaceSesionMapper enlaceSesionMapper;

    public SesionProgramadaResponseDTO toResponseDTO(Sesion sesion) {
        SesionProgramadaResponseDTO dto = new SesionProgramadaResponseDTO();
        dto.setSesionId(sesion.getId());

        List<EnlaceSesion> enlaces = sesion.getEnlaces();
        if (enlaces != null && !enlaces.isEmpty()) {
            List<EnlaceSesionResponseDTO> enlacesDTO = enlaces.stream()
                    .map(enlace -> enlaceSesionMapper.toResponseDTO(enlace)) // lambda explícita
                    .collect(Collectors.toList());

            dto.setEnlaces(enlacesDTO);
            dto.setEnlaceDisponible(true);
            dto.setMensaje("Redirigiendo al enlace de la tutoría...");
        } else {
            dto.setEnlaceDisponible(false);
            dto.setMensaje("El tutor aún no ha compartido el enlace de la sesión");
            dto.setEnlaces(List.of()); // Devolver lista vacía
        }

        return dto;
    }
}