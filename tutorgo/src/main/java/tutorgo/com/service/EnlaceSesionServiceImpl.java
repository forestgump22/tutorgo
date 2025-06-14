package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.EnlaceSesionRequestDTO;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.mapper.EnlaceSesionMapper;
import tutorgo.com.model.EnlaceSesion;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.EnlaceSesionRepository;
import tutorgo.com.repository.SesionRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnlaceSesionServiceImpl implements EnlaceSesionService {

    private final EnlaceSesionRepository enlaceSesionRepository;
    private final SesionRepository sesionRepository;
    private final EnlaceSesionMapper enlaceSesionMapper;
    private static final int MAX_ENLACES = 5;

    @Override
    public void eliminarEnlacePorId(Long enlaceId, String emailTutorAutenticado) {
        EnlaceSesion enlaceSesion = enlaceSesionRepository.findById(enlaceId)
                .orElseThrow(() -> new RuntimeException("Enlace no encontrado"));

        Sesion sesion = enlaceSesion.getSesion();
        Tutor tutorSesion = sesion.getTutor();

        User userTutor = tutorSesion.getUser();
        if (!userTutor.getEmail().equalsIgnoreCase(emailTutorAutenticado)) {
            throw new AccessDeniedException("No tienes permiso para eliminar este enlace.");
        }

        enlaceSesionRepository.delete(enlaceSesion);
    }

    @Override
    public List<EnlaceSesionResponseDTO> guardarEnlaces(Long sesionId, List<EnlaceSesionRequestDTO> enlacesDTO, String emailTutorAutenticado) {
        Sesion sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        // Validar que solo el tutor dueño pueda modificar
        String emailDelCreador = sesion.getTutor().getUser().getEmail();
        if (!emailDelCreador.equalsIgnoreCase(emailTutorAutenticado)) {
            throw new AccessDeniedException("No tienes permiso para agregar enlaces a esta sesión.");
        }

        // Validar máximo 5 enlaces
        int enlacesActuales = sesion.getEnlaces() != null ? sesion.getEnlaces().size() : 0;
        if (enlacesActuales + enlacesDTO.size() > 5) {
            throw new IllegalStateException("No se pueden agregar más de 5 enlaces por sesión.");
        }

        List<EnlaceSesion> enlaces = enlacesDTO.stream()
                .map(dto -> {
                    EnlaceSesion enlace = new EnlaceSesion();
                    enlace.setNombre(dto.getNombre());
                    enlace.setEnlace(dto.getEnlace());
                    enlace.setSesion(sesion);
                    return enlace;
                })
                .toList();

        List<EnlaceSesion> guardados = enlaceSesionRepository.saveAll(enlaces);

        return guardados.stream()
                .map(enlaceSesionMapper::toResponseDTO)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<EnlaceSesionResponseDTO> obtenerEnlacesPorSesion(Long sesionId) {
        return enlaceSesionRepository.findBySesionId(sesionId).stream()
                .map(enlaceSesionMapper::toDTO)
                .collect(Collectors.toList());
    }
}
