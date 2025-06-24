package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.enums.RoleName;
import tutorgo.com.enums.TipoNotificacionEstEnum;
import tutorgo.com.enums.TipoNotificacionTutorEnum;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.model.*;
import tutorgo.com.repository.NotificacionEstudianteRepository;
import tutorgo.com.repository.NotificacionTutorRepository;
import tutorgo.com.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias para NotificacionServiceImpl")
class NotificacionServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificacionEstudianteRepository notificacionEstudianteRepository;

    @Mock
    private NotificacionTutorRepository notificacionTutorRepository;

    @InjectMocks
    private NotificacionServiceImpl notificacionService;

    private User mockUserEstudiante;
    private User mockUserTutor;
    private Estudiante mockEstudiante;
    private Tutor mockTutor;

    @BeforeEach
    void setUp() {
        // Configuración de un usuario ESTUDIANTE
        Role roleEstudiante = new Role(3, RoleName.ESTUDIANTE);
        mockUserEstudiante = User.builder().id(1L).email("estudiante@test.com").role(roleEstudiante).build();
        mockEstudiante = Estudiante.builder().id(1L).user(mockUserEstudiante).build();
        mockUserEstudiante.setStudentProfile(mockEstudiante);

        // Configuración de un usuario TUTOR
        Role roleTutor = new Role(2, RoleName.TUTOR);
        mockUserTutor = User.builder().id(2L).email("tutor@test.com").role(roleTutor).build();
        mockTutor = Tutor.builder().id(1L).user(mockUserTutor).build();
        mockUserTutor.setTutorProfile(mockTutor);
    }

    @Nested
    @DisplayName("Pruebas para getMisNotificaciones")
    class GetMisNotificacionesTests {

        @Test
        @DisplayName("Debe devolver las notificaciones de un estudiante si el rol es ESTUDIANTE")
        void getMisNotificaciones_whenUserIsEstudiante_shouldReturnEstudianteNotifications() {
            // Arrange
            String emailEstudiante = "estudiante@test.com";
            NotificacionEstudiante notificacion = new NotificacionEstudiante();
            notificacion.setId(1L);
            notificacion.setTitulo("Recordatorio");
            notificacion.setTexto("Tu clase es mañana.");
            notificacion.setFechaCreacion(LocalDateTime.now());
            notificacion.setTipo(TipoNotificacionEstEnum.RECORDATORIO);

            when(userRepository.findByEmail(emailEstudiante)).thenReturn(Optional.of(mockUserEstudiante));
            when(notificacionEstudianteRepository.findByEstudianteOrderByFechaCreacionDesc(mockEstudiante))
                    .thenReturn(List.of(notificacion));

            // Act
            List<NotificacionResponse> result = notificacionService.getMisNotificaciones(emailEstudiante);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Recordatorio", result.get(0).getTitulo());
            assertEquals("RECORDATORIO", result.get(0).getTipo()); // Verificar que el tipo se mapea a String
        }

        @Test
        @DisplayName("Debe devolver las notificaciones de un tutor si el rol es TUTOR")
        void getMisNotificaciones_whenUserIsTutor_shouldReturnTutorNotifications() {
            // Arrange
            String emailTutor = "tutor@test.com";
            NotificacionTutor notificacion = new NotificacionTutor();
            notificacion.setId(1L);
            notificacion.setTitulo("Nueva Reserva");
            notificacion.setTexto("Un alumno ha reservado una clase.");
            notificacion.setFechaCreacion(LocalDateTime.now());
            // ***** CORRECCIÓN AQUÍ: Asignar el tipo *****
            notificacion.setTipo(TipoNotificacionTutorEnum.RESERVA);

            when(userRepository.findByEmail(emailTutor)).thenReturn(Optional.of(mockUserTutor));
            when(notificacionTutorRepository.findByTutorOrderByFechaCreacionDesc(mockTutor))
                    .thenReturn(List.of(notificacion));

            // Act
            List<NotificacionResponse> result = notificacionService.getMisNotificaciones(emailTutor);

            // Assert
            assertNotNull(result);
            assertEquals(1, result.size());
            assertEquals("Nueva Reserva", result.get(0).getTitulo());
            assertEquals("RESERVA", result.get(0).getTipo()); // Verificar
        }
        @Test
        @DisplayName("Debe devolver una lista vacía si el usuario no tiene notificaciones")
        void getMisNotificaciones_whenUserHasNoNotifications_shouldReturnEmptyList() {
            // Arrange
            String emailEstudiante = "estudiante@test.com";
            when(userRepository.findByEmail(emailEstudiante)).thenReturn(Optional.of(mockUserEstudiante));
            when(notificacionEstudianteRepository.findByEstudianteOrderByFechaCreacionDesc(mockEstudiante))
                    .thenReturn(Collections.emptyList());

            // Act
            List<NotificacionResponse> result = notificacionService.getMisNotificaciones(emailEstudiante);

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el usuario no existe")
        void getMisNotificaciones_whenUserNotFound_shouldThrowException() {
            // Arrange
            String nonExistentEmail = "noexiste@test.com";
            when(userRepository.findByEmail(nonExistentEmail)).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> {
                notificacionService.getMisNotificaciones(nonExistentEmail);
            });
        }

        @Test
        @DisplayName("Debe devolver una lista vacía si el usuario no tiene perfil de estudiante o tutor")
        void getMisNotificaciones_whenUserHasNoProfile_shouldReturnEmptyList() {
            // Arrange
            String emailSinPerfil = "sinperfil@test.com";
            User userSinPerfil = User.builder().id(3L).email(emailSinPerfil).role(new Role(3, RoleName.ESTUDIANTE)).build();
            // Importante: no le asignamos un studentProfile

            when(userRepository.findByEmail(emailSinPerfil)).thenReturn(Optional.of(userSinPerfil));

            // Act
            List<NotificacionResponse> result = notificacionService.getMisNotificaciones(emailSinPerfil);

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }
    }
}