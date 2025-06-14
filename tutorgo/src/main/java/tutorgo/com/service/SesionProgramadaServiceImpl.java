package tutorgo.com.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.response.SesionProgramadaResponseDTO;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.mapper.SesionProgramadaMapper;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Sesion;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.SesionRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SesionProgramadaServiceImpl implements SesionProgramadaService {

    private final EstudianteRepository estudianteRepository;
    private final SesionRepository sesionRepository;
    private final SesionProgramadaMapper sesionProgramadaMapper;


    @Override
    public SesionProgramadaResponseDTO obtenerSesionProgramadaDelEstudianteAutenticado(String emailEstudiante) {
        Estudiante estudiante = estudianteRepository.findByUserEmail(emailEstudiante)
                .orElseThrow(() -> new BadRequestException("Estudiante no encontrado."));

        Optional<Sesion> sesionProgramada = estudiante.getSesionesComoEstudiante().stream()
                .filter(s -> s.getHoraInicial().isAfter(LocalDateTime.now()))
                .sorted((s1, s2) -> s1.getHoraInicial().compareTo(s2.getHoraInicial()))
                .findFirst();

        if (sesionProgramada.isPresent()) {
            return sesionProgramadaMapper.toResponseDTO(sesionProgramada.get());
        }

        SesionProgramadaResponseDTO dto = new SesionProgramadaResponseDTO();
        dto.setSesionId(null);
        dto.setEnlaceDisponible(false);
        dto.setMensaje("No tienes sesiones programadas próximamente.");
        return dto;
    }

}
