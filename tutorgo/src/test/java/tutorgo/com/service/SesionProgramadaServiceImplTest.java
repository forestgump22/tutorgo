package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import tutorgo.com.dto.response.SesionProgramadaResponseDTO;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.mapper.SesionProgramadaMapper;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.User;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.SesionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

// HU12
public class SesionProgramadaServiceImplTest {

    private EstudianteRepository estudianteRepository;
    private SesionRepository sesionRepository;
    private SesionProgramadaMapper sesionProgramadaMapper;
    private SesionProgramadaServiceImpl sesionProgramadaService;

    @BeforeEach
    void setUp() {
        estudianteRepository = mock(EstudianteRepository.class);
        sesionRepository = mock(SesionRepository.class);
        sesionProgramadaMapper = mock(SesionProgramadaMapper.class);
        sesionProgramadaService = new SesionProgramadaServiceImpl(estudianteRepository, sesionRepository, sesionProgramadaMapper);
    }

    @Test
    void testObtenerSesionProgramadaDelEstudianteAutenticado_sesionExiste() {
        String email = "test@email.com";

        Estudiante estudiante = new Estudiante();
        estudiante.setId(1L);
        estudiante.setUser(User.builder().email(email).build());

        Sesion sesion = new Sesion();
        sesion.setHoraInicial(LocalDateTime.now().plusDays(1));

        estudiante.setSesionesComoEstudiante(List.of(sesion));

        SesionProgramadaResponseDTO dtoEsperado = new SesionProgramadaResponseDTO();
        dtoEsperado.setSesionId(1L);

        when(estudianteRepository.findByUserEmail(email)).thenReturn(Optional.of(estudiante));
        when(sesionProgramadaMapper.toResponseDTO(sesion)).thenReturn(dtoEsperado);

        SesionProgramadaResponseDTO result = sesionProgramadaService.obtenerSesionProgramadaDelEstudianteAutenticado(email);

        assertNotNull(result);
        assertEquals(dtoEsperado.getSesionId(), result.getSesionId());
    }

    @Test
    void testObtenerSesionProgramadaDelEstudianteAutenticado_sinSesiones() {
        String email = "test@email.com";

        Estudiante estudiante = new Estudiante();
        estudiante.setId(1L);
        estudiante.setUser(User.builder().email(email).build());

        estudiante.setSesionesComoEstudiante(List.of());

        when(estudianteRepository.findByUserEmail(email)).thenReturn(Optional.of(estudiante));

        SesionProgramadaResponseDTO result = sesionProgramadaService.obtenerSesionProgramadaDelEstudianteAutenticado(email);

        assertNotNull(result);
        assertNull(result.getSesionId());
        assertFalse(result.isEnlaceDisponible());
        assertEquals("No tienes sesiones programadas próximamente.", result.getMensaje());
    }

    @Test
    void testObtenerSesionProgramadaDelEstudianteAutenticado_estudianteNoExiste() {
        String email = "inexistente@email.com";

        when(estudianteRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> {
            sesionProgramadaService.obtenerSesionProgramadaDelEstudianteAutenticado(email);
        });
    }
}
