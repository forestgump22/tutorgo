package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TutorMapper;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.TutorRepository;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TutorServiceImplTest {

    @Mock
    private TutorRepository tutorRepository;

    @Mock
    private TutorMapper tutorMapper;

    @InjectMocks
    private TutorServiceImpl tutorService;

    private Tutor mockTutor;
    private User mockUser;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .nombre("Juan Tutor")
                .email("juan@tutor.com")
                .build();

        mockTutor = Tutor.builder()
                .id(1L)
                .user(mockUser)
                .bio("Experto en derivadas e integrales.")
                .estrellasPromedio(4.8f)
                .tarifaHora(50)
                .build();

        pageable = PageRequest.of(0, 10);
    }

    @Nested
    class GetAllTutoresTests {

        @Test
        void testGetAllTutores_sinFiltros() {
            // Arrange
            List<Tutor> tutores = List.of(mockTutor);
            when(tutorRepository.findWithNumericFilters(null, null)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(null, null, null, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(null, null);
            verify(tutorMapper).tutorsToTutorSummaryResponseList(anyList());
            assertNotNull(result);
        }

        @Test
        void testGetAllTutores_conFiltros() {
            // Arrange
            String query = "Juan";
            Integer maxPrecio = 100;
            Float puntuacion = 4.5f;
            List<Tutor> tutores = List.of(mockTutor);
            when(tutorRepository.findWithNumericFilters(maxPrecio, puntuacion)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(query, maxPrecio, puntuacion, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(maxPrecio, puntuacion);
        }

        @Test
        void testGetAllTutores_conQueryVacia() {
            // Arrange
            String query = "   ";
            List<Tutor> tutores = List.of(mockTutor);
            when(tutorRepository.findWithNumericFilters(null, null)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(query, null, null, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(null, null);
        }

        @Test
        void testGetAllTutores_conQueryYFiltros() {
            // Arrange
            String query = "Matemáticas";
            Integer maxPrecio = 80;
            Float puntuacion = 4.0f;
            List<Tutor> tutores = List.of(mockTutor);
            when(tutorRepository.findWithNumericFilters(maxPrecio, puntuacion)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(query, maxPrecio, puntuacion, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(maxPrecio, puntuacion);
        }

        @Test
        void testGetAllTutores_listaVacia() {
            // Arrange
            List<Tutor> tutores = List.of();
            when(tutorRepository.findWithNumericFilters(null, null)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of());

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(null, null, null, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(null, null);
            assertNotNull(result);
            assertEquals(0, result.getContent().size());
        }

        @Test
        void testGetAllTutores_conFiltrosParciales() {
            // Arrange
            Integer maxPrecio = 60;
            List<Tutor> tutores = List.of(mockTutor);
            when(tutorRepository.findWithNumericFilters(maxPrecio, null)).thenReturn(tutores);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores("Juan", maxPrecio, null, pageable);

            // Assert
            verify(tutorRepository).findWithNumericFilters(maxPrecio, null);
        }
    }

    @Nested
    class GetTutorProfileTests {

        @Test
        void testGetTutorProfile_tutorExiste() {
            // Arrange
            Long tutorId = 1L;
            when(tutorRepository.findById(tutorId)).thenReturn(Optional.of(mockTutor));

            // Act
            var result = tutorService.getTutorProfile(tutorId);

            // Assert
            verify(tutorRepository).findById(tutorId);
            assertNotNull(result);
            assertEquals(mockTutor.getId(), result.getId());
        }

        @Test
        void testGetTutorProfile_tutorNoExiste() {
            // Arrange
            Long tutorId = 999L;
            when(tutorRepository.findById(tutorId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> tutorService.getTutorProfile(tutorId));
            verify(tutorRepository).findById(tutorId);
        }
    }
}