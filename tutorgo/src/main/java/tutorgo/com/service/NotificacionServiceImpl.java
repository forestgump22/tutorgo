// src/main/java/tutorgo/com/service/NotificacionServiceImpl.java
package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {

    private final UserRepository userRepository;
    private final NotificacionEstudianteRepository notificacionEstudianteRepository;
    private final NotificacionTutorRepository notificacionTutorRepository;

    @Override
    public List<NotificacionResponse> getMisNotificaciones(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if ("ESTUDIANTE".equals(user.getRole().getNombre().name())) {
            Estudiante estudiante = user.getStudentProfile();
            if (estudiante == null) return List.of();

            return notificacionEstudianteRepository.findByEstudianteOrderByFechaCreacionDesc(estudiante)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

        } else if ("TUTOR".equals(user.getRole().getNombre().name())) {
            Tutor tutor = user.getTutorProfile();
            if (tutor == null) return List.of();

            return notificacionTutorRepository.findByTutorOrderByFechaCreacionDesc(tutor)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return List.of(); // Si es ADMIN o rol no reconocido, no devuelve nada.
    }

    // Mappers privados para convertir entidades a DTOs comunes
    private NotificacionResponse mapToResponse(NotificacionEstudiante n) {
        return NotificacionResponse.fromEntity(n);
    }

    private NotificacionResponse mapToResponse(NotificacionTutor n) {
        return NotificacionResponse.fromEntity(n);
    }
}