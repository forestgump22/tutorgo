package tutorgo.com.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tutorgo.com.dto.response.ApiResponse;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.service.TutorService;
import tutorgo.com.utils.AppConstants;

@RestController
@RequestMapping("/tutores")
@RequiredArgsConstructor
public class TutorController {

    private final TutorService tutorService;

    // Endpoint existente para HU7 (Lista de tutores)
    @GetMapping
    public ResponseEntity<?> getAllTutores(
            @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER, required = false) int page,
            @RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE, required = false) int size,
            @RequestParam(value = "sortBy", defaultValue = AppConstants.DEFAULT_SORT_BY_TUTOR, required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = AppConstants.DEFAULT_SORT_DIRECTION, required = false) String sortDir
    ) {
        Sort.Direction direction = Sort.Direction.ASC;
        if (sortDir.equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        PagedResponse<TutorSummaryResponse> response = tutorService.getAllTutores(pageable);

        if (response.getContent() == null || response.getContent().isEmpty()) {
            return ResponseEntity.ok(new ApiResponse(true, "Aún no hay tutores disponibles. Vuelve a intentarlo más tarde.", response));
        }
        return ResponseEntity.ok(response);
    }

}