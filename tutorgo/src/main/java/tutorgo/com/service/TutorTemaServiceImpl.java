package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.request.TutorTemaRequest;
import tutorgo.com.dto.response.TemaResponse;
import tutorgo.com.dto.response.TutorTemaResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TutorTemaMapper;
import tutorgo.com.model.Tema;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.TutorTema;
import tutorgo.com.repository.TemaRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.repository.TutorTemaRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TutorTemaServiceImpl implements TutorTemaService {

    private final TutorTemaRepository tutorTemaRepository;
    private final TutorRepository tutorRepository;
    private final TemaRepository temaRepository;
    private final TutorTemaMapper mapper;

    @Override
    public TutorTemaResponse asignarTema(TutorTemaRequest request) {
        Tutor tutor = tutorRepository.findById(request.getTutorId())
                .orElseThrow(() -> new ResourceNotFoundException("Tutor no encontrado"));
        
        Tema tema = temaRepository.findById(request.getTemaId())
                .orElseThrow(() -> new ResourceNotFoundException("Tema no encontrado"));

        // Validar que el tema sea un subtema (tenga padre)
        if (tema.getTemaPadre() == null) {
            throw new BadRequestException("Solo se pueden asignar subtemas a los tutores, no temas principales.");
        }

        // Validar que el tutor no tenga temas de diferentes categorías principales
        validarTemaPrincipalConsistente(tutor.getId(), tema.getTemaPadre().getId());

        TutorTema tutorTema = mapper.toEntityFromRequest(request, tutor, tema);
        TutorTema saved = tutorTemaRepository.save(tutorTema);

        return mapper.toResponseDTO(saved);
    }

    @Override
    public List<TutorTemaResponse> listarTemasPorTutor(Long tutorId) {
        List<TutorTema> lista = tutorTemaRepository.findByTutorId(tutorId);
        return lista.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<TutorTemaResponse> listarSubtemasPorTutor(Long tutorId) {
        List<TutorTema> subtemas = tutorTemaRepository.findByTutorIdAndTemaTemaPadreIsNotNull(tutorId);
        return subtemas.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public TemaResponse obtenerTemaPrincipalPorTutor(Long tutorId) {
        Optional<TutorTema> primerTema = tutorTemaRepository.findFirstByTutorId(tutorId);
        
        if (primerTema.isEmpty()) {
            throw new ResourceNotFoundException("El tutor no tiene temas asignados.");
        }

        Tema temaPrincipal = primerTema.get().getTema().getTemaPadre();
        if (temaPrincipal == null) {
            throw new BadRequestException("El tutor tiene un tema principal asignado en lugar de subtemas.");
        }

        return mapper.toTemaResponseDTO(temaPrincipal);
    }

    @Override
    public void eliminarAsignacion(Long asignacionId) {
        if (!tutorTemaRepository.existsById(asignacionId)) {
            throw new ResourceNotFoundException("Asignación no encontrada.");
        }
        tutorTemaRepository.deleteById(asignacionId);
    }

    private void validarTemaPrincipalConsistente(Long tutorId, Long nuevoTemaPrincipalId) {
        // Si el tutor ya tiene temas asignados, verificar que el nuevo tema sea del mismo tema principal
        if (tutorTemaRepository.existsByTutorId(tutorId)) {
            List<TutorTema> temasExistentes = tutorTemaRepository.findByTutorId(tutorId);
            
            if (!temasExistentes.isEmpty()) {
                Tema temaPrincipalExistente = temasExistentes.get(0).getTema().getTemaPadre();
                
                if (temaPrincipalExistente != null && !temaPrincipalExistente.getId().equals(nuevoTemaPrincipalId)) {
                    throw new BadRequestException("Un tutor solo puede tener subtemas del mismo tema principal. " +
                            "Tema principal actual: " + temaPrincipalExistente.getNombre() + 
                            ", Nuevo tema principal: " + nuevoTemaPrincipalId);
                }
            }
        }
    }
}
