package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.response.PagedResponse;// Nueva importación
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TutorMapper;
import tutorgo.com.model.Tutor;
import tutorgo.com.repository.TutorRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TutorServiceImpl implements TutorService {

    private final TutorRepository tutorRepository;
    private final TutorMapper tutorMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TutorSummaryResponse> getAllTutores(Pageable pageable) {
        Page<Tutor> tutoresPage = tutorRepository.findAll(pageable);
        if (tutoresPage.getNumberOfElements() == 0) {
            return new PagedResponse<>(List.of(), tutoresPage.getNumber(),
                    tutoresPage.getSize(), tutoresPage.getTotalElements(),
                    tutoresPage.getTotalPages(), tutoresPage.isLast());
        }
        List<TutorSummaryResponse> tutorSummaryResponses = tutorMapper.tutorsToTutorSummaryResponseList(tutoresPage.getContent());
        return new PagedResponse<>(tutorSummaryResponses, tutoresPage.getNumber(),
                tutoresPage.getSize(), tutoresPage.getTotalElements(),
                tutoresPage.getTotalPages(), tutoresPage.isLast());
    }

}