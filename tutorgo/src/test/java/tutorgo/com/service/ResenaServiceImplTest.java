package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import tutorgo.com.dto.request.ResenaRequestDTO;
import tutorgo.com.dto.response.ResenaResponseDTO;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.ResenaMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.ResenaRepository;
import tutorgo.com.repository.SesionRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

//HU13
public class ResenaServiceImplTest {

    @InjectMocks
    private ResenaServiceImpl resenaService;

    @Mock
    private ResenaRepository resenaRepository;

    @Mock
    private SesionRepository sesionRepository;

    @Mock
    private ResenaMapper resenaMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void crearResena_Exitosa() {
        // Arrange
        Long sesionId = 1L;
        String emailEstudiante = "estudiante@example.com";

        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(5);
        requestDTO.setComentario("Excelente sesión");

        User user = new User();
        user.setEmail(emailEstudiante);

        Estudiante estudiante = new Estudiante();
        estudiante.setUser(user);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setEstudiante(estudiante);

        Resena resena = new Resena();
        resena.setCalificacion(5);
        resena.setComentario("Excelente sesión");
        resena.setSesion(sesion);

        Resena resenaGuardada = new Resena();
        resenaGuardada.setId(10L);
        resenaGuardada.setCalificacion(5);
        resenaGuardada.setComentario("Excelente sesión");

        ResenaResponseDTO responseDTO = new ResenaResponseDTO();
        responseDTO.setId(10L);
        responseDTO.setCalificacion(5);
        responseDTO.setComentario("Excelente sesión");

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));
        when(resenaRepository.existsBySesionId(sesionId)).thenReturn(false);
        when(resenaMapper.toEntity(requestDTO)).thenReturn(resena);
        when(resenaRepository.save(resena)).thenReturn(resenaGuardada);
        when(resenaMapper.toDTO(resenaGuardada)).thenReturn(responseDTO);

        // Act
        ResenaResponseDTO resultado = resenaService.crearResena(sesionId, requestDTO, emailEstudiante);

        // Assert
        assertNotNull(resultado);
        assertEquals(10L, resultado.getId());
        assertEquals(5, resultado.getCalificacion());
        assertEquals("Excelente sesión", resultado.getComentario());
    }

    @Test
    void crearResena_LanzaException_SesionNoExiste() {
        when(sesionRepository.findById(99L)).thenReturn(Optional.empty());

        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(4);

        assertThrows(ResourceNotFoundException.class,
                () -> resenaService.crearResena(99L, requestDTO, "email@fake.com"));
    }

    @Test
    void crearResena_LanzaException_CalificacionInvalida() {
        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(6); // fuera de rango

        assertThrows(BadRequestException.class,
                () -> resenaService.crearResena(1L, requestDTO, "email@fake.com"));
    }

    @Test
    void crearResena_LanzaException_ComentarioLargo() {
        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(4);
        requestDTO.setComentario("a".repeat(501)); // muy largo

        assertThrows(BadRequestException.class,
                () -> resenaService.crearResena(1L, requestDTO, "email@fake.com"));
    }

    @Test
    void crearResena_LanzaException_ResenaYaExiste() {
        Long sesionId = 1L;

        User user = new User();
        user.setEmail("student@example.com");

        Estudiante estudiante = new Estudiante();
        estudiante.setUser(user);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setEstudiante(estudiante);

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));
        when(resenaRepository.existsBySesionId(sesionId)).thenReturn(true);

        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(4);

        assertThrows(BadRequestException.class,
                () -> resenaService.crearResena(sesionId, requestDTO, "student@example.com"));
    }

    @Test
    void crearResena_LanzaException_EmailNoCoincide() {
        Long sesionId = 1L;

        User user = new User();
        user.setEmail("otro@correo.com");

        Estudiante estudiante = new Estudiante();
        estudiante.setUser(user);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setEstudiante(estudiante);

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));
        when(resenaRepository.existsBySesionId(sesionId)).thenReturn(false);

        ResenaRequestDTO requestDTO = new ResenaRequestDTO();
        requestDTO.setCalificacion(5);

        assertThrows(BadRequestException.class,
                () -> resenaService.crearResena(sesionId, requestDTO, "student@example.com"));
    }
}
