// src/main/java/tutorgo/com/service/TutorService.java
package tutorgo.com.service;

import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;

public interface TutorService {

    PagedResponse<TutorSummaryResponse> getAllTutores(String query, Integer maxPrecio, Float puntuacion, Pageable pageable);

    TutorProfileResponse getTutorProfile(Long tutorId);
}