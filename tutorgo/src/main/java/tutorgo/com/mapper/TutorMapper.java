package tutorgo.com.mapper;

import org.springframework.stereotype.Component;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TutorMapper {

    // ... (método tutorToTutorSummaryResponse y tutorsToTutorSummaryResponseList existentes) ...
    public TutorSummaryResponse tutorToTutorSummaryResponse(Tutor tutor) {
        if (tutor == null) {
            return null;
        }
        TutorSummaryResponse response = new TutorSummaryResponse();
        response.setTutorId(tutor.getId());
        
        // Obtener el tema principal dinámicamente
        String temaPrincipal = obtenerTemaPrincipal(tutor);
        response.setTemaPrincipal(temaPrincipal);
        
        response.setEstrellasPromedio(tutor.getEstrellasPromedio());
        User user = tutor.getUser();
        if (user != null) {
            response.setNombreUsuario(user.getNombre());
            response.setFotoUrlUsuario(user.getFotoUrl());
        } else {
            response.setNombreUsuario("Nombre no disponible");
        }
        response.setTarifaHora(tutor.getTarifaHora());
        return response;
    }

    public List<TutorSummaryResponse> tutorsToTutorSummaryResponseList(List<Tutor> tutores) {
        if (tutores == null) {
            return List.of();
        }
        return tutores.stream()
                .map(this::tutorToTutorSummaryResponse)
                .collect(Collectors.toList());
    }

    private String obtenerTemaPrincipal(Tutor tutor) {
        if (tutor.getTutorTemas() != null && !tutor.getTutorTemas().isEmpty()) {
            // Obtener el primer tema asignado y buscar su tema padre
            var primerTema = tutor.getTutorTemas().get(0).getTema();
            if (primerTema.getTemaPadre() != null) {
                return primerTema.getTemaPadre().getNombre();
            }
        }
        return "Sin tema asignado";
    }
}