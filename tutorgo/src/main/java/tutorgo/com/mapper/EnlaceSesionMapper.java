package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.request.EnlaceSesionRequestDTO;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;
import tutorgo.com.model.EnlaceSesion;
import tutorgo.com.model.Sesion;

@Component
public class EnlaceSesionMapper {

    public  EnlaceSesion toEntity(EnlaceSesionRequestDTO dto, Sesion sesion) {
        EnlaceSesion enlace = new EnlaceSesion();
        enlace.setNombre(dto.getNombre());
        enlace.setEnlace(dto.getEnlace());
        enlace.setSesion(sesion);
        return enlace;
    }

    public EnlaceSesionResponseDTO toDTO(EnlaceSesion entity) {
        EnlaceSesionResponseDTO dto = new EnlaceSesionResponseDTO();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setEnlace(entity.getEnlace());
        return dto;
    }

    public EnlaceSesionResponseDTO toResponseDTO(EnlaceSesion enlace) {
        EnlaceSesionResponseDTO dto = new EnlaceSesionResponseDTO();
        dto.setId(enlace.getId());
        dto.setNombre(enlace.getNombre());
        dto.setEnlace(enlace.getEnlace());
        return dto;
    }
}
