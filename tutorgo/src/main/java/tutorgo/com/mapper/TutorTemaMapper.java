package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.request.TutorTemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.dto.response.TutorTemaResponse;
import tutorgo.com.model.Tema;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.TutorTema;

@Component
public class TutorTemaMapper {

    public TutorTema toEntityFromRequest(TutorTemaRequest request, Tutor tutor, Tema tema) {
        TutorTema tt = new TutorTema();
        tt.setTutor(tutor);
        tt.setTema(tema);
        return tt;
    }

    public TutorTemaResponse toResponseDTO(TutorTema entity) {
        TutorTemaResponse dto = new TutorTemaResponse();
        dto.setId(entity.getId());
        dto.setTutorId(entity.getTutor().getId());
        dto.setNombreTutor(entity.getTutor().getUser().getNombre());
        dto.setTemaId(entity.getTema().getId());
        dto.setNombreTema(entity.getTema().getNombre());
        return dto;
    }

    public TemaResponse toTemaResponseDTO(Tema tema) {
        TemaResponse dto = new TemaResponse();
        dto.setId(tema.getId());
        dto.setNombre(tema.getNombre());
        dto.setDescripcion(tema.getDescripcion());
        
        if (tema.getTemaPadre() != null) {
            dto.setTemaPadreId(tema.getTemaPadre().getId());
        }
        
        if (tema.getSubtemas() != null && !tema.getSubtemas().isEmpty()) {
            dto.setSubtemas(tema.getSubtemas().stream()
                    .map(this::toTemaResponseDTO)
                    .collect(java.util.stream.Collectors.toList()));
        }
        
        return dto;
    }
}
