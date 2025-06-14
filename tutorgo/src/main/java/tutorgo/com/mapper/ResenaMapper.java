package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.request.ResenaRequestDTO;
import tutorgo.com.dto.response.ResenaResponseDTO;
import tutorgo.com.model.Resena;

@Component
public class ResenaMapper {

    public Resena toEntity(ResenaRequestDTO dto) {
        Resena resena = new Resena();
        resena.setCalificacion(dto.getCalificacion());
        resena.setComentario(dto.getComentario());
        return resena;
    }

    public ResenaResponseDTO toDTO(Resena resena) {
        ResenaResponseDTO dto = new ResenaResponseDTO();
        dto.setId(resena.getId());
        dto.setCalificacion(resena.getCalificacion());
        dto.setComentario(resena.getComentario());
        return dto;
    }
}