package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.response.CentroEstudioResponse;
import tutorgo.com.repository.CentroEstudioRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CentroEstudioService {

    private final CentroEstudioRepository centroEstudioRepository;

    public List<CentroEstudioResponse> getAllCentrosEstudio() {
        return centroEstudioRepository.findAll().stream()
                .map(ce -> new CentroEstudioResponse(ce.getId(), ce.getNombre()))
                .collect(Collectors.toList());
    }
}