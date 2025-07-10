package tutorgo.com.service;

import tutorgo.com.dto.request.TutorTemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.dto.response.TutorTemaResponse;

import java.util.List;

public interface TutorTemaService {
    TutorTemaResponse asignarTema(TutorTemaRequest request);
    List<TutorTemaResponse> listarTemasPorTutor(Long tutorId);
    List<TutorTemaResponse> listarSubtemasPorTutor(Long tutorId);
    TemaResponse obtenerTemaPrincipalPorTutor(Long tutorId);
    void eliminarAsignacion(Long asignacionId);
}
