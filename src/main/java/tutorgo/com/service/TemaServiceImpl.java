package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.request.TemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TemaMapper;
import tutorgo.com.model.Tema;
import tutorgo.com.repository.TemaRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemaServiceImpl implements TemaService {

    private final TemaRepository temaRepository;
    private final TemaMapper temaMapper;

    @Override
    public TemaResponse crearTema(TemaRequest request) {
        Tema tema = temaMapper.toEntityFromRequest(request);

        if (request.getTemaPadreId() != null) {
            Optional<Tema> padre = temaRepository.findById(request.getTemaPadreId());
            padre.ifPresent(tema::setTemaPadre);
        }

        Tema saved = temaRepository.save(tema);
        return temaMapper.toResponseDTO(saved);
    }

    @Override
    public List<TemaResponse> obtenerTemasJerarquicos() {
        List<Tema> temasRaiz = temaRepository.findByTemaPadreIsNull();
        return temasRaiz.stream()
                .map(temaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TemaResponse> obtenerTemasPrincipales() {
        List<Tema> temasPrincipales = temaRepository.findByTemaPadreIsNull();
        return temasPrincipales.stream()
                .map(temaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TemaResponse> obtenerSubtemasPorTema(Long temaId) {
        // Verificar que el tema existe
        Tema tema = temaRepository.findById(temaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tema no encontrado con ID: " + temaId));
        
        // Verificar que es un tema principal (no tiene padre)
        if (tema.getTemaPadre() != null) {
            throw new BadRequestException("El tema con ID " + temaId + " no es un tema principal.");
        }
        
        List<Tema> subtemas = temaRepository.findByTemaPadreId(temaId);
        return subtemas.stream()
                .map(temaMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}