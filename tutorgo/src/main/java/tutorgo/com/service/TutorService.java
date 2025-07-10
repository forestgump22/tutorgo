package tutorgo.com.service;

import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import java.time.LocalDate;
import java.time.LocalTime;

public interface TutorService {
    PagedResponse<TutorSummaryResponse> getAllTutores(
            String query,
            Integer maxPrecio,
            Float puntuacion,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            LocalTime horaInicio, // <-- Nuevo
            LocalTime horaFin,     // <-- Nuevo
            Pageable pageable
    );

    TutorProfileResponse getTutorProfile(Long tutorId);
}