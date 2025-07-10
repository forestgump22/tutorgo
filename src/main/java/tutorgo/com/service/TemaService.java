package tutorgo.com.service;

import tutorgo.com.dto.request.TemaRequest;
import tutorgo.com.dto.response.TemaResponse;

import java.util.List;

public interface TemaService {
    TemaResponse crearTema(TemaRequest request);
    List<TemaResponse> obtenerTemasJerarquicos();
    List<TemaResponse> obtenerTemasPrincipales();
    List<TemaResponse> obtenerSubtemasPorTema(Long temaId);
}