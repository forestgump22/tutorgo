package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tutorgo.com.dto.request.ConfirmarPagoRequest;
import tutorgo.com.dto.response.PagoResponse;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.enums.MetodoPagoEnum;
import tutorgo.com.enums.RoleName;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.PagoMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;

import java.math.BigDecimal;
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
@DisplayName("Pruebas Unitarias para PagoServiceImpl")
class PagoServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private SesionRepository sesionRepository;
    @Mock private PagoRepository pagoRepository;
    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private PagoMapper pagoMapper;
    // No necesitas mockear TutorRepository si no lo usas directamente en el servicio

    @InjectMocks
    private PagoServiceImpl pagoService;

    private User mockUserAlumno;
    private Estudiante mockAlumno;
    private Tutor mockTutor;
    private Sesion mockSesionPendiente;
    private ConfirmarPagoRequest confirmarPagoRequest;
    private final String alumnoEmail = "alumno.pago@example.com";
    private final Long sesionId = 1L;

    @BeforeEach
    void setUp() {
        mockUserAlumno = User.builder().id(1L).email(alumnoEmail).role(new Role(3, null)).build();
        mockAlumno = Estudiante.builder().id(1L).user(mockUserAlumno).build();
        mockTutor = Tutor.builder().id(1L).tarifaHora(60).user(User.builder().id(2L).build()).build();

        mockSesionPendiente = Sesion.builder()
                .id(sesionId)
                .estudiante(mockAlumno)
                .tutor(mockTutor)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0))
                .horaFinal(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).withSecond(0).withNano(0)) // 1 hora
                .tipoEstado(EstadoSesionEnum.PENDIENTE)
                .build();

        mockUserAlumno.setStudentProfile(mockAlumno); // Asegurar la relación bidireccional

        confirmarPagoRequest = new ConfirmarPagoRequest();
        confirmarPagoRequest.setSesionId(sesionId);
        confirmarPagoRequest.setMetodoPago(MetodoPagoEnum.TARJETA_CREDITO);
    }

    @Nested
    @DisplayName("Pruebas para procesarPagoYConfirmarSesion (HU10)")
    class ProcesarPagoTests {

        @Test
        @DisplayName("Debe procesar el pago, confirmar la sesión y dividir la disponibilidad correctamente")
        void procesarPagoYConfirmarSesion_whenSuccess_shouldUpdateEntitiesAndReturnResponse() {
            // --- ARRANGE ---

            // 1. Datos de la sesión y el pago
            Pago mockPagoGuardado = new Pago();
            PagoResponse mockPagoResponse = new PagoResponse();

            // 2. Disponibilidad ORIGINAL que devolverá el mock del repositorio.
            // Esta es la versión "antes" de que el servicio la modifique.
            Disponibilidad disponibilidadOriginalParaMock = Disponibilidad.builder()
                    .id(12L)
                    .tutor(mockTutor)
                    .fecha(mockSesionPendiente.getFecha())
                    .horaInicial(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(9, 0)))  // 09:00
                    .horaFinal(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(12, 0))) // 12:00
                    .build();

            // 3. Configuración de los mocks
            when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
            when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
            when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));
            when(pagoRepository.save(any(Pago.class))).thenReturn(mockPagoGuardado);
            when(pagoMapper.toPagoResponse(mockPagoGuardado)).thenReturn(mockPagoResponse);
            // El repositorio devolverá nuestra disponibilidad original cuando se le pregunte.
            when(disponibilidadRepository.findDisponibilidadQueEnvuelveElSlot(anyLong(), any(), any(), any()))
                    .thenReturn(List.of(disponibilidadOriginalParaMock));

            // --- ACT ---
            pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest);

            // --- ASSERT ---

            // 1. Verificar que se guardó un pago y se actualizó la sesión
            verify(pagoRepository).save(any(Pago.class));
            verify(sesionRepository).save(argThat(sesion -> sesion.getTipoEstado() == EstadoSesionEnum.CONFIRMADO));

            // 2. Capturar los objetos 'Disponibilidad' que se pasaron al método save()
            ArgumentCaptor<Disponibilidad> disponibilidadCaptor = ArgumentCaptor.forClass(Disponibilidad.class);
            verify(disponibilidadRepository, times(2)).save(disponibilidadCaptor.capture());

            List<Disponibilidad> disponibilidadesGuardadas = disponibilidadCaptor.getAllValues();

            // 3. Asignar las capturas a variables para claridad
            Disponibilidad primerBloqueGuardado = disponibilidadesGuardadas.get(0);
            Disponibilidad segundoBloqueGuardado = disponibilidadesGuardadas.get(1);

            // 4. Aserciones explícitas sobre los objetos capturados

            // Verificación del PRIMER bloque (el original, acortado)
            assertEquals(12L, primerBloqueGuardado.getId(), "El ID del primer bloque debe ser el original.");
            assertEquals(
                    disponibilidadOriginalParaMock.getHoraInicial(), // 09:00
                    primerBloqueGuardado.getHoraInicial(),
                    "La hora de inicio del primer bloque debe ser la original."
            );
            assertEquals(
                    mockSesionPendiente.getHoraInicial(), // 10:00
                    primerBloqueGuardado.getHoraFinal(),
                    "La hora final del primer bloque debe ser la hora de inicio de la sesión."
            );

            // Verificación del SEGUNDO bloque (el nuevo, creado después)
            // El ID debería ser diferente (o nulo si no lo seteamos en el mock, lo cual está bien)
            assertEquals(
                    mockSesionPendiente.getHoraFinal(), // 11:00
                    segundoBloqueGuardado.getHoraInicial(),
                    "La hora de inicio del segundo bloque debe ser la hora final de la sesión."
            );
            assertEquals(
                    disponibilidadOriginalParaMock.getHoraFinal(), // 12:00
                    segundoBloqueGuardado.getHoraFinal(),
                    "La hora final del segundo bloque debe ser la hora final del bloque original."
            );
        }

        @Test
        @DisplayName("Debe lanzar BadRequestException si la sesión no está pendiente")
        void procesarPagoYConfirmarSesion_whenSesionNotPendiente_shouldThrowBadRequest() {
            mockSesionPendiente.setTipoEstado(EstadoSesionEnum.CONFIRMADO);
            when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
            when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
            when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));

            assertThrows(BadRequestException.class, () ->
                    pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest)
            );
        }

        @Test
        @DisplayName("Debe lanzar ForbiddenException si la sesión no pertenece al alumno")
        void procesarPagoYConfirmarSesion_whenSesionBelongsToOther_shouldThrowForbidden() {
            Estudiante otroAlumno = Estudiante.builder().id(99L).user(new User()).build();
            mockSesionPendiente.setEstudiante(otroAlumno);

            when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
            when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
            when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));

            assertThrows(ForbiddenException.class, () ->
                    pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest)
            );
        }
    }

    @Nested
    @DisplayName("Pruebas para obtenerHistorialTransacciones (HU15)")
    class GetHistorialTests {

        @Test
        @DisplayName("Debe devolver el historial de un estudiante")
        void obtenerHistorialTransacciones_forEstudiante_shouldSucceed() {
            // Arrange
            when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
            when(pagoRepository.findByEstudianteIdWithDetails(mockAlumno.getId())).thenReturn(Collections.emptyList());

            // Act
            List<PagoResponse> result = pagoService.obtenerHistorialTransacciones(alumnoEmail);

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(pagoRepository).findByEstudianteIdWithDetails(mockAlumno.getId());
            verify(pagoRepository, never()).findByTutorIdWithDetails(anyLong());
        }

        @Test
        @DisplayName("Debe devolver el historial de un tutor")
        void obtenerHistorialTransacciones_forTutor_shouldSucceed() {
            // Arrange
            String emailTutor = "tutor.pago@example.com";
            User mockUserTutor = User.builder().id(2L).email(emailTutor).role(new Role(2, RoleName.TUTOR)).build();
            Tutor mockTutorHistorial = Tutor.builder().id(2L).user(mockUserTutor).build();
            mockUserTutor.setTutorProfile(mockTutorHistorial);

            when(userRepository.findByEmail(emailTutor)).thenReturn(Optional.of(mockUserTutor));
            when(pagoRepository.findByTutorIdWithDetails(mockTutorHistorial.getId())).thenReturn(Collections.emptyList());

            // Act
            List<PagoResponse> result = pagoService.obtenerHistorialTransacciones(emailTutor);

            // Assert
            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(pagoRepository).findByTutorIdWithDetails(mockTutorHistorial.getId());
            verify(pagoRepository, never()).findByEstudianteIdWithDetails(anyLong());
        }
    }
}