package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tutorgo.com.dto.request.ReservaTutoriaRequest;
import tutorgo.com.dto.response.SesionResponse;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.SesionMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Pruebas Unitarias para SesionServiceImpl")
class SesionServiceImplTest {

    // Mocks para todas las dependencias del servicio
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private TutorRepository tutorRepository;
    @Mock private SesionRepository sesionRepository;
    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private SesionMapper sesionMapper;
    // No necesitamos UserRepository si buscamos por perfil directamente

    @InjectMocks
    private SesionServiceImpl sesionService;

    private Estudiante mockAlumno;
    private Tutor mockTutor;
    private ReservaTutoriaRequest reservaRequest;
    private final String alumnoEmail = "alumno@example.com";

    @BeforeEach
    void setUp() {
        // Configuramos objetos de prueba realistas
        User mockUserAlumno = User.builder().id(1L).email(alumnoEmail).build();
        mockAlumno = Estudiante.builder().id(1L).user(mockUserAlumno).build();
        User mockUserTutor = User.builder().id(2L).email("tutor@example.com").build();
        mockTutor = Tutor.builder().id(1L).user(mockUserTutor).build();

        reservaRequest = new ReservaTutoriaRequest();
        reservaRequest.setTutorId(mockTutor.getId());
        reservaRequest.setFecha(LocalDate.now().plusDays(2)); // Usar 2 días para evitar conflictos de zona horaria
        reservaRequest.setHoraInicio(LocalTime.of(15, 0));
        reservaRequest.setHoraFinal(LocalTime.of(16, 0));
    }

    @Nested
    @DisplayName("Pruebas para reservarTutoria (HU8)")
    class ReservarTutoriaTests {

        @Test
        @DisplayName("Debe crear una reserva exitosamente si todas las condiciones se cumplen")
        void reservarTutoria_whenSuccessful_shouldCreateAndReturnSession() {
            // Arrange
            LocalDateTime inicioSesion = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraInicio());
            LocalDateTime finSesion = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraFinal());

            // Simulamos una disponibilidad que "envuelve" la sesión solicitada
            Disponibilidad disp = new Disponibilidad();

            // Simular lo que el servicio va a buscar
            when(estudianteRepository.findByUserEmail(alumnoEmail)).thenReturn(Optional.of(mockAlumno));
            when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));

            // Simular que el tutor tiene disponibilidad
            when(disponibilidadRepository.findDisponibilidadQueEnvuelveElSlot(anyLong(), any(), any(), any())).thenReturn(List.of(disp));

            // Simular que no hay sesiones solapadas para el tutor ni para el alumno
            when(sesionRepository.findSesionesSolapadasParaTutor(anyLong(), any(), any(), any())).thenReturn(Collections.emptyList());
            when(sesionRepository.findSesionesSolapadasParaEstudiante(anyLong(), any(), any(), any())).thenReturn(Collections.emptyList());

            // Simular el guardado y el mapeo
            when(sesionRepository.save(any(Sesion.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(sesionMapper.toSesionResponse(any(Sesion.class))).thenReturn(new SesionResponse());

            // Act
            SesionResponse result = sesionService.reservarTutoria(alumnoEmail, reservaRequest);

            // Assert
            assertNotNull(result);

            // Verificamos que se llamó al método save con una sesión en estado PENDIENTE
            verify(sesionRepository).save(argThat(sesion ->
                    sesion.getTipoEstado() == EstadoSesionEnum.PENDIENTE &&
                            sesion.getTutor().getId().equals(mockTutor.getId()) &&
                            sesion.getEstudiante().getId().equals(mockAlumno.getId())
            ));
        }

        @Test
        @DisplayName("Debe lanzar BadRequestException si el horario no está dentro de la disponibilidad")
        void reservarTutoria_whenTutorNotAvailable_shouldThrowBadRequest() {
            // Arrange
            when(estudianteRepository.findByUserEmail(alumnoEmail)).thenReturn(Optional.of(mockAlumno));
            when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
            // Simulamos que el método que busca disponibilidad devuelve una lista vacía
            when(disponibilidadRepository.findDisponibilidadQueEnvuelveElSlot(anyLong(), any(), any(), any())).thenReturn(Collections.emptyList());

            // Act & Assert
            BadRequestException exception = assertThrows(BadRequestException.class, () -> {
                sesionService.reservarTutoria(alumnoEmail, reservaRequest);
            });
            assertEquals("El horario solicitado no está dentro de la disponibilidad del tutor.", exception.getMessage());
        }

        @Test
        @DisplayName("Debe lanzar BadRequestException si el horario ya está ocupado por otra sesión")
        void reservarTutoria_whenSlotIsBooked_shouldThrowBadRequest() {
            // Arrange
            when(estudianteRepository.findByUserEmail(alumnoEmail)).thenReturn(Optional.of(mockAlumno));
            when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
            when(disponibilidadRepository.findDisponibilidadQueEnvuelveElSlot(anyLong(), any(), any(), any())).thenReturn(List.of(new Disponibilidad()));
            // Simulamos que ya existe una sesión en ese horario para el tutor
            when(sesionRepository.findSesionesSolapadasParaTutor(anyLong(), any(), any(), any())).thenReturn(List.of(new Sesion()));

            // Act & Assert
            BadRequestException exception = assertThrows(BadRequestException.class, () -> {
                sesionService.reservarTutoria(alumnoEmail, reservaRequest);
            });
            assertEquals("El horario seleccionado ya no está disponible o está ocupado.", exception.getMessage());
        }

        @Test
        @DisplayName("Debe lanzar ResourceNotFoundException si el tutor no existe")
        void reservarTutoria_whenTutorNotFound_shouldThrowResourceNotFound() {
            // Arrange
            when(estudianteRepository.findByUserEmail(alumnoEmail)).thenReturn(Optional.of(mockAlumno));
            when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.empty());

            // Act & Assert
            assertThrows(ResourceNotFoundException.class, () -> {
                sesionService.reservarTutoria(alumnoEmail, reservaRequest);
            });
        }

        @Test
        @DisplayName("Debe lanzar BadRequestException si la hora final es anterior a la inicial")
        void reservarTutoria_whenEndTimeIsBeforeStartTime_shouldThrowBadRequest() {
            // Arrange
            reservaRequest.setHoraFinal(LocalTime.of(9, 0)); // Hora fin < hora inicio (10:00)
            when(estudianteRepository.findByUserEmail(alumnoEmail)).thenReturn(Optional.of(mockAlumno));
            when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));

            // Act & Assert
            BadRequestException exception = assertThrows(BadRequestException.class, () -> {
                sesionService.reservarTutoria(alumnoEmail, reservaRequest);
            });
            assertEquals("La hora de finalización debe ser posterior a la hora de inicio.", exception.getMessage());
        }
    }
}