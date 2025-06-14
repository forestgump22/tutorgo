package tutorgo.com.service;

import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorDetailResponse; // Nueva importación
import tutorgo.com.dto.response.TutorSummaryResponse;

public interface TutorService {
    PagedResponse<TutorSummaryResponse> getAllTutores(Pageable pageable);

}