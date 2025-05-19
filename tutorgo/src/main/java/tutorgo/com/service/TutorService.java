package tutorgo.com.service;

import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;

public interface TutorService {
    PagedResponse<TutorSummaryResponse> getAllTutores(Pageable pageable);

}