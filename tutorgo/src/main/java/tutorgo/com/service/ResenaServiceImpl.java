package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tutorgo.com.dto.request.ResenaRequestDTO;
import tutorgo.com.dto.response.ResenaResponseDTO;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.ResenaMapper;
import tutorgo.com.model.Resena;
import tutorgo.com.model.Sesion;
import tutorgo.com.repository.ResenaRepository;
import tutorgo.com.repository.SesionRepository;

@Service
@RequiredArgsConstructor
public class ResenaServiceImpl implements ResenaService {

    private final ResenaRepository resenaRepository;
    private final SesionRepository sesionRepository;
    private final ResenaMapper resenaMapper;

    @Override
    @Transactional
    public ResenaResponseDTO crearResena(Long sesionId, ResenaRequestDTO requestDTO, String emailEstudiante) {

        // Validación de calificación
        if (requestDTO.getCalificacion() == null || requestDTO.getCalificacion() < 1 || requestDTO.getCalificacion() > 5) {
            throw new BadRequestException("La calificación debe ser entre 1 y 5");
        }

        // Validación de comentario (si existe)
        if (requestDTO.getComentario() != null && requestDTO.getComentario().length() > 500) {
            throw new BadRequestException("El comentario no puede exceder los 500 caracteres");
        }

        // Verificar que la sesión exista
        Sesion sesion = sesionRepository.findById(sesionId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada con ID: " + sesionId));

        // Validar que la sesión no tenga reseña previa
        if (resenaRepository.existsBySesionId(sesionId)) {
            throw new BadRequestException("Esta sesión ya tiene una reseña registrada");
        }

        // Validar que el estudiante autenticado sea el dueño de la sesión
        String emailSesionEstudiante = sesion.getEstudiante().getUser().getEmail();
        if (!emailSesionEstudiante.equalsIgnoreCase(emailEstudiante)) {
            throw new BadRequestException("No tienes permiso para calificar esta sesión.");
        }

        // Crear y guardar reseña
        Resena resena = resenaMapper.toEntity(requestDTO);
        resena.setSesion(sesion);

        Resena guardada = resenaRepository.save(resena);
        return resenaMapper.toDTO(guardada);
    }
}
