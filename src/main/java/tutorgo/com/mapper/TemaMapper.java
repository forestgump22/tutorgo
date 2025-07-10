package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.request.TemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.model.Tema;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TemaMapper {

    public Tema toEntityFromRequest(TemaRequest request) {
        Tema tema = new Tema();
        tema.setNombre(request.getNombre());
        tema.setDescripcion(request.getDescripcion());
        // temaPadre se setea desde el service usando temaPadreId
        return tema;
    }

    public TemaResponse toResponseDTO(Tema tema) {
        if (tema == null) return null;

        TemaResponse dto = new TemaResponse();
        dto.setId(tema.getId());
        dto.setNombre(tema.getNombre());
        dto.setDescripcion(tema.getDescripcion());
        dto.setTemaPadreId(tema.getTemaPadre() != null ? tema.getTemaPadre().getId() : null);

        if (tema.getSubtemas() != null && !tema.getSubtemas().isEmpty()) {
            List<TemaResponse> subtemas = tema.getSubtemas().stream()
                    .map(this::toResponseDTO)
                    .collect(Collectors.toList());
            dto.setSubtemas(subtemas);
        }

        return dto;
    }
}
