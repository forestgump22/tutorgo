package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.access.AccessDeniedException;
import tutorgo.com.dto.request.EnlaceSesionRequestDTO;
import tutorgo.com.dto.response.EnlaceSesionResponseDTO;
import tutorgo.com.mapper.EnlaceSesionMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.EnlaceSesionRepository;
import tutorgo.com.repository.SesionRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

//HU11
class EnlaceSesionServiceImplTest {

    @InjectMocks
    private EnlaceSesionServiceImpl service;

    @Mock
    private EnlaceSesionRepository enlaceSesionRepository;

    @Mock
    private SesionRepository sesionRepository;

    @Mock
    private EnlaceSesionMapper enlaceSesionMapper;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void guardarEnlaces_Correctamente() {
        // Preparar datos
        Long sesionId = 1L;
        String emailTutor = "tutor@example.com";

        EnlaceSesionRequestDTO requestDTO = new EnlaceSesionRequestDTO();
        requestDTO.setNombre("Zoom");
        requestDTO.setEnlace("http://zoom.com");

        User tutorUser = new User();
        tutorUser.setEmail(emailTutor);

        Tutor tutor = new Tutor();
        tutor.setUser(tutorUser);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setTutor(tutor);
        sesion.setEnlaces(new ArrayList<>());  // Enlaces actuales = 0

        EnlaceSesion entity = new EnlaceSesion();
        entity.setNombre("Zoom");
        entity.setEnlace("http://zoom.com");
        entity.setSesion(sesion);

        EnlaceSesionResponseDTO responseDTO = new EnlaceSesionResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setNombre("Zoom");
        responseDTO.setEnlace("http://zoom.com");

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));
        when(enlaceSesionRepository.saveAll(anyList())).thenReturn(List.of(entity));
        when(enlaceSesionMapper.toResponseDTO(any(EnlaceSesion.class))).thenReturn(responseDTO);

        // Ejecutar
        List<EnlaceSesionResponseDTO> result = service.guardarEnlaces(
                sesionId, List.of(requestDTO), emailTutor
        );

        // Verificar
        assertEquals(1, result.size());
        assertEquals("Zoom", result.get(0).getNombre());
        verify(enlaceSesionRepository).saveAll(anyList());
    }

    @Test
    void guardarEnlaces_MasDe5_DeberiaFallar() {
        Long sesionId = 1L;
        String emailTutor = "tutor@example.com";

        User user = new User();
        user.setEmail(emailTutor);
        Tutor tutor = new Tutor();
        tutor.setUser(user);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setTutor(tutor);
        List<EnlaceSesion> enlacesActuales = new ArrayList<>(Collections.nCopies(5, new EnlaceSesion()));
        sesion.setEnlaces(enlacesActuales);  // ya hay 5

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));

        EnlaceSesionRequestDTO nuevoEnlace = new EnlaceSesionRequestDTO();
        nuevoEnlace.setNombre("Nuevo");
        nuevoEnlace.setEnlace("http://nuevo.com");

        // Ejecutar y verificar
        assertThrows(IllegalStateException.class, () ->
                service.guardarEnlaces(sesionId, List.of(nuevoEnlace), emailTutor));
    }

    @Test
    void guardarEnlaces_EmailTutorNoCoincide_DeberiaFallar() {
        Long sesionId = 1L;
        String emailTutor = "otro@example.com"; // no es el dueño

        User user = new User();
        user.setEmail("tutor@example.com");
        Tutor tutor = new Tutor();
        tutor.setUser(user);

        Sesion sesion = new Sesion();
        sesion.setId(sesionId);
        sesion.setTutor(tutor);

        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(sesion));

        EnlaceSesionRequestDTO dto = new EnlaceSesionRequestDTO();
        dto.setNombre("Zoom");
        dto.setEnlace("http://zoom.com");

        assertThrows(AccessDeniedException.class, () ->
                service.guardarEnlaces(sesionId, List.of(dto), emailTutor));
    }
}
