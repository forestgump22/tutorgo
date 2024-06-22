package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.TutorSummaryResponse;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.TutorMapper;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.TutorRepository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias para TutorServiceImpl")
class TutorServiceImplTest {

    @Mock
    private TutorRepository tutorRepository;

    @Mock
    private TutorMapper tutorMapper;

    @InjectMocks
    private TutorServiceImpl tutorService;

    private Pageable pageable;
    private Tutor mockTutor;
    private User mockUser;

    @BeforeEach
    void setUp() {
        pageable = PageRequest.of(0, 9);
        mockUser = User.builder().id(1L).nombre("Profesor de Cálculo").fotoUrl("http://example.com/foto.png").build();
        mockTutor = Tutor.builder()
                .id(1L)
                .user(mockUser)
                .rubro("Matemáticas")
                .bio("Experto en derivadas e integrales.")
                .estrellasPromedio(4.8f)
                .tarifaHora(100)
                .build();
    }

    @Nested
    @DisplayName("Pruebas para getAllTutores (HU7 con Filtros)")
    class GetAllTutoresTests {

        @Test
        @DisplayName("Debe llamar a searchWithFilters con filtros nulos si no se proveen")
        void getAllTutores_whenNoFilters_shouldCallRepositoryWithNulls() {
            // Arrange
            Page<Tutor> tutorPage = new PageImpl<>(List.of(mockTutor));
            // Suponemos que la firma del método en el repositorio acepta 3 filtros
            when(tutorRepository.searchWithFilters(null, null, null, pageable)).thenReturn(tutorPage);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            // Llamamos al servicio pasando null para todos los filtros
            tutorService.getAllTutores(null, null, null, pageable);

            // Assert
            // Verificamos que se llamó al método correcto con todos los filtros nulos
            verify(tutorRepository).searchWithFilters(null, null, null, pageable);
            verify(tutorMapper).tutorsToTutorSummaryResponseList(anyList());
        }

        @Test
        @DisplayName("Debe llamar a searchWithFilters con todos los parámetros de filtro")
        void getAllTutores_withAllFilters_shouldCallRepositoryWithAllParameters() {
            // Arrange
            String query = "Cálculo";
            Integer maxPrecio = 120;
            Float puntuacion = 4.5f;
            Page<Tutor> tutorPage = new PageImpl<>(List.of(mockTutor));
            when(tutorRepository.searchWithFilters(query, maxPrecio, puntuacion, pageable)).thenReturn(tutorPage);
            when(tutorMapper.tutorsToTutorSummaryResponseList(anyList())).thenReturn(List.of(new TutorSummaryResponse()));

            // Act
            tutorService.getAllTutores(query, maxPrecio, puntuacion, pageable);

            // Assert
            verify(tutorRepository).searchWithFilters(query, maxPrecio, puntuacion, pageable);
        }

        @Test
        @DisplayName("Debe tratar una query en blanco como nula")
        void getAllTutores_whenQueryIsBlank_shouldBeTreatedAsNull() {
            // Arrange
            String blankQuery = "   ";
            Page<Tutor> tutorPage = Page.empty(pageable);

            // El servicio debe convertir la query en blanco a null antes de pasarla al repositorio
            when(tutorRepository.searchWithFilters(eq(null), any(), any(), any(Pageable.class)))
                    .thenReturn(tutorPage);

            // Act
            tutorService.getAllTutores(blankQuery, null, null, pageable);

            // Assert
            // Verificamos que la lógica StringUtils.hasText() funciona y pasa null al repositorio
            verify(tutorRepository).searchWithFilters(null, null, null, pageable);
        }

        @Test
        @DisplayName("Debe devolver una respuesta paginada vacía si la búsqueda no encuentra resultados")
        void getAllTutores_whenNoResultsFound_shouldReturnEmptyResponse() {
            // Arrange
            String query = "Física Cuántica";
            Integer maxPrecio = 50;
            Float puntuacion = 5.0f;
            Page<Tutor> emptyPage = Page.empty(pageable);

            // Configuramos el mock para que espere exactamente estos valores
            when(tutorRepository.searchWithFilters(eq(query), eq(maxPrecio), eq(puntuacion), any(Pageable.class)))
                    .thenReturn(emptyPage);

            // Act
            PagedResponse<TutorSummaryResponse> result = tutorService.getAllTutores(query, maxPrecio, puntuacion, pageable);

            // Assert
            assertNotNull(result);
            assertTrue(result.getContent().isEmpty(), "El contenido de la respuesta debería estar vacío");
            assertEquals(0, result.getTotalElements());

            // Verificamos que el mapper no fue llamado porque no había nada que mapear
            verify(tutorMapper, never()).tutorsToTutorSummaryResponseList(any());
        }
    }
    @Nested
    @DisplayName("Pruebas para getTutorProfile (HU16)")
    class GetTutorProfileTests {

        @Test
        @DisplayName("Debe devolver el perfil completo del tutor si el ID existe")
        void getTutorProfile_whenTutorExists_shouldReturnProfile() {
            // Arrange
            when(tutorRepository.findById(1L)).thenReturn(Optional.of(mockTutor));

            // Act
            TutorProfileResponse response = tutorService.getTutorProfile(1L);

            // Assert
            assertNotNull(response);
            assertEquals(mockTutor.getId(), response.getId());
            assertEquals(mockUser.getNombre(), response.getNombreUsuario());

            verify(tutorRepository).findById(1L);
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el tutor no existe")
        void getTutorProfile_whenTutorNotFound_shouldThrowResourceNotFoundException() {
            // Arrange
            Long nonExistentId = 99L;
            when(tutorRepository.findById(nonExistentId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> tutorService.getTutorProfile(nonExistentId));
        }
    }
}