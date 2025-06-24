package tutorgo.com.service;

import tutorgo.com.dto.request.DisponibilidadRequest;
import tutorgo.com.dto.response.DisponibilidadResponse;

import java.util.List;

public interface DisponibilidadService {
    DisponibilidadResponse addDisponibilidad(String tutorEmail, DisponibilidadRequest request);
    DisponibilidadResponse updateDisponibilidad(String tutorEmail, Long disponibilidadId, DisponibilidadRequest request);
    List<DisponibilidadResponse> getDisponibilidadesByTutor(String tutorEmail);
    void deleteDisponibilidad(String tutorEmail, Long disponibilidadId);
    List<DisponibilidadResponse> getDisponibilidadesByTutorId(Long tutorId);
}