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

import java.time.LocalDate;
import java.time.LocalTime;
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
    public PagedResponse<TutorSummaryResponse> getAllTutores(
            String query, Integer maxPrecio, Float puntuacion,
            LocalDate fechaInicio, LocalDate fechaFin,
            LocalTime horaInicio, LocalTime horaFin,
            Pageable pageable) {

        List<Tutor> tutoresPrefiltrados = tutorRepository.findWithNumericFilters(maxPrecio, puntuacion);

        List<Tutor> tutoresDisponibles = tutoresPrefiltrados.stream().filter(tutor -> {
            if (fechaInicio == null && fechaFin == null && horaInicio == null && horaFin == null) {
                return true;
            }

            final LocalDate fInicio = (fechaInicio != null) ? fechaInicio : LocalDate.now();
            final LocalDate fFin = (fechaFin != null) ? fechaFin : fInicio.plusYears(1); // Un rango por defecto amplio si solo se da una fecha
            final LocalTime hInicio = (horaInicio != null) ? horaInicio : LocalTime.MIN;
            final LocalTime hFin = (horaFin != null) ? horaFin : LocalTime.MAX;

            if (fFin.isBefore(fInicio) || hFin.isBefore(hInicio)) {
                return true;
            }

            return tutor.getDisponibilidades().stream().anyMatch(disp -> {
                boolean fechaCoincide = !disp.getFecha().isBefore(fInicio) && !disp.getFecha().isAfter(fFin);
                if (!fechaCoincide) {
                    return false;
                }

                LocalTime dispInicio = disp.getHoraInicial().toLocalTime();
                LocalTime dispFin = disp.getHoraFinal().toLocalTime();

                boolean horaCoincide = dispInicio.isBefore(hFin) && dispFin.isAfter(hInicio);

                return horaCoincide;
            });
        }).collect(Collectors.toList());



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
            tutoresFiltrados = tutoresDisponibles;
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), tutoresFiltrados.size());

        List<Tutor> paginaDeTutores = (start <= end) ? tutoresFiltrados.subList(start, end) : Collections.emptyList();

        List<TutorSummaryResponse> dtos = tutorMapper.tutorsToTutorSummaryResponseList(paginaDeTutores);

        return new PagedResponse<>(
                dtos,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                tutoresFiltrados.size(),
                (int) Math.ceil((double) tutoresFiltrados.size() / pageable.getPageSize()),
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