// src/main/java/tutorgo/com/service/TutorServiceImpl.java
package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TutorMapper;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.TutorRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TutorServiceImpl implements TutorService {

    private final TutorRepository tutorRepository;
    private final TutorMapper tutorMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TutorSummaryResponse> getAllTutores(String query, Integer maxPrecio, Float puntuacion, Pageable pageable) {

        // 1. Obtenemos los tutores filtrados solo por los campos numéricos (que no dan error)
        List<Tutor> tutoresPrefiltrados = tutorRepository.findWithNumericFilters(maxPrecio, puntuacion);

        // 2. Si hay un término de búsqueda (query), filtramos la lista en memoria (en Java)
        List<Tutor> tutoresFiltrados;
        if (StringUtils.hasText(query)) {
            String lowerCaseQuery = query.trim().toLowerCase();
            tutoresFiltrados = tutoresPrefiltrados.stream()
                    .filter(tutor -> {
                        boolean nombreCoincide = tutor.getUser() != null && tutor.getUser().getNombre().toLowerCase().contains(lowerCaseQuery);
                        boolean rubroCoincide = tutor.getRubro().toLowerCase().contains(lowerCaseQuery);
                        return nombreCoincide || rubroCoincide;
                    })
                    .collect(Collectors.toList());
        } else {
            tutoresFiltrados = tutoresPrefiltrados;
        }

        // 3. Aplicamos la paginación manualmente a la lista final
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), tutoresFiltrados.size());

        List<Tutor> paginaDeTutores = (start <= end) ? tutoresFiltrados.subList(start, end) : Collections.emptyList();

        // 4. Mapeamos solo la página de tutores a DTOs
        List<TutorSummaryResponse> dtos = tutorMapper.tutorsToTutorSummaryResponseList(paginaDeTutores);

        // 5. Construimos el PagedResponse manualmente
        return new PagedResponse<>(
                dtos,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                tutoresFiltrados.size(), // El total de elementos es el de la lista filtrada
                (int) Math.ceil((double) tutoresFiltrados.size() / pageable.getPageSize()), // Cálculo de páginas totales
                pageable.getPageNumber() >= (int) Math.ceil((double) tutoresFiltrados.size() / pageable.getPageSize()) - 1
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TutorProfileResponse getTutorProfile(Long tutorId) {
        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() -> new ResourceNotFoundException("Tutor no encontrado"));

        TutorProfileResponse response = new TutorProfileResponse();
        response.setId(tutor.getId());
        response.setTarifaHora(tutor.getTarifaHora());
        response.setRubro(tutor.getRubro());
        response.setBio(tutor.getBio());
        response.setEstrellasPromedio(tutor.getEstrellasPromedio());

        User user = tutor.getUser();
        if (user != null) {
            response.setNombreUsuario(user.getNombre());
            response.setFotoUrlUsuario(user.getFotoUrl());
        }

        return response;
    }
};