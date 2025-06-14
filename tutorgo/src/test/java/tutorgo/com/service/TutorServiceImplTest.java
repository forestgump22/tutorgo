package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.mapper.TutorMapper;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User; // Necesario para crear Tutor
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.model.User;       // Nueva importación
import org.springframework.data.domain.Sort;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TutorServiceImplTest {

    @Mock
    private TutorRepository tutorRepository;

    @Mock
    private TutorMapper tutorMapper;

    @InjectMocks
    private TutorServiceImpl tutorService;

    private Pageable pageable;

    @BeforeEach
    void setUp() {
        pageable = PageRequest.of(0, 10);
    }

    // HU7 Escenario 1: Obtención exitosa
    @Test
    void getAllTutores_Success_ReturnsPagedTutores() {
        User mockUser = User.builder().id(1L).nombre("Tutor Uno").fotoUrl("foto.jpg").build();
        Tutor mockTutor = Tutor.builder().id(1L).user(mockUser).rubro("Matemáticas").estrellasPromedio(4.5f).build();
        Page<Tutor> tutorPage = new PageImpl<>(List.of(mockTutor), pageable, 1);

        TutorSummaryResponse summaryResponse = new TutorSummaryResponse();
        summaryResponse.setTutorId(1L);
        summaryResponse.setNombreUsuario("Tutor Uno");
        summaryResponse.setRubro("Matemáticas");
        summaryResponse.setEstrellasPromedio(4.5f);

        when(tutorRepository.findAll(pageable)).thenReturn(tutorPage);
        when(tutorMapper.tutorsToTutorSummaryResponseList(List.of(mockTutor))).thenReturn(List.of(summaryResponse));

        PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Tutor Uno", result.getContent().get(0).getNombreUsuario());
        assertEquals(0, result.getPageNumber());
        assertEquals(1, result.getTotalPages());
    }

    // HU7 Escenario 2: Lista vacía
    @Test
    void getAllTutores_EmptyList_ReturnsEmptyPagedResponse() {
        Page<Tutor> emptyTutorPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(tutorRepository.findAll(pageable)).thenReturn(emptyTutorPage);
        // El mapper no debería ser llamado si la lista de contenido está vacía antes del mapeo

        PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(pageable);

        assertNotNull(result);
        assertTrue(result.getContent().isEmpty());
        assertEquals(0, result.getTotalElements());
        assertEquals(0, result.getPageNumber());
    }

    // HU7 Escenario 3: Error en la carga (Simulado por una excepción del repositorio)
    // No es necesario probar directamente aquí, ya que el GlobalExceptionHandler lo manejaría.
    // Si quisiéramos probar que el servicio propaga la excepción:
    @Test
    void getAllTutores_RepositoryThrowsException_PropagatesException() {
        when(tutorRepository.findAll(pageable)).thenThrow(new RuntimeException("Error de BD simulado"));

        assertThrows(RuntimeException.class, () -> {
            tutorService.getAllTutores(pageable);
        });
    }
}