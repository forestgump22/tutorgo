package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
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
class SesionServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private TutorRepository tutorRepository;
    @Mock private SesionRepository sesionRepository;
    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private SesionMapper sesionMapper;

    @InjectMocks private SesionServiceImpl sesionService;

    private User mockUserAlumno;
    private Estudiante mockAlumno;
    private Tutor mockTutor;
    private ReservaTutoriaRequest reservaRequest;
    private String alumnoEmail = "alumno@example.com";

    @BeforeEach
    void setUp() {
        mockUserAlumno = User.builder().id(1L).email(alumnoEmail).build();
        mockAlumno = Estudiante.builder().id(1L).user(mockUserAlumno).build();
        User mockUserTutor = User.builder().id(2L).email("tutor@example.com").build();
        mockTutor = Tutor.builder().id(1L).user(mockUserTutor).build();

        reservaRequest = new ReservaTutoriaRequest();
        reservaRequest.setTutorId(mockTutor.getId());
        reservaRequest.setFecha(LocalDate.now().plusDays(1));
        reservaRequest.setHoraInicio(LocalTime.of(10, 0));
        reservaRequest.setHoraFinal(LocalTime.of(11, 0));
    }

    // HU8 Escenario 1: Reserva exitosa
    @Test
    void reservarTutoria_Success() {
        LocalDateTime inicio = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraInicio());
        LocalDateTime fin = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraFinal());

        Disponibilidad disp = new Disponibilidad(); // Simular disponibilidad
        disp.setHoraInicial(inicio.minusHours(1)); // Tutor disponible desde antes
        disp.setHoraFinal(fin.plusHours(1));     // Tutor disponible hasta después

        Sesion nuevaSesion = Sesion.builder()
                .id(1L).estudiante(mockAlumno).tutor(mockTutor)
                .fecha(reservaRequest.getFecha()).horaInicial(inicio).horaFinal(fin)
                .tipoEstado(EstadoSesionEnum.PENDIENTE).build();

        SesionResponse mockResponse = new SesionResponse(); // Llenar con datos esperados
        mockResponse.setId(1L);
        mockResponse.setTipoEstado(EstadoSesionEnum.PENDIENTE);


        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findByTutorAndFecha(mockTutor, reservaRequest.getFecha())).thenReturn(List.of(disp));
        when(sesionRepository.findSesionesSolapadasParaTutor(anyLong(), any(LocalDate.class), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(sesionRepository.save(any(Sesion.class))).thenReturn(nuevaSesion);
        when(sesionMapper.toSesionResponse(nuevaSesion)).thenReturn(mockResponse);

        SesionResponse result = sesionService.reservarTutoria(alumnoEmail, reservaRequest);

        assertNotNull(result);
        assertEquals(EstadoSesionEnum.PENDIENTE, result.getTipoEstado());
        verify(sesionRepository).save(any(Sesion.class));
    }

    // HU8 Escenario 2: Turno no disponible (fuera de disponibilidad del tutor)
    @Test
    void reservarTutoria_TutorNotAvailable_ThrowsBadRequestException() {
        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
        // Simular que no hay disponibilidades o que no cubren el horario
        when(disponibilidadRepository.findByTutorAndFecha(mockTutor, reservaRequest.getFecha())).thenReturn(Collections.emptyList());

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            sesionService.reservarTutoria(alumnoEmail, reservaRequest);
        });
        assertEquals("El tutor no está disponible en la fecha y hora seleccionadas.", exception.getMessage());
    }

    // HU8 Escenario 2: Turno ocupado (sesión solapada)
    @Test
    void reservarTutoria_SlotAlreadyBooked_ThrowsBadRequestException() {
        LocalDateTime inicio = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraInicio());
        LocalDateTime fin = LocalDateTime.of(reservaRequest.getFecha(), reservaRequest.getHoraFinal());
        Disponibilidad disp = new Disponibilidad();
        disp.setHoraInicial(inicio.minusHours(1));
        disp.setHoraFinal(fin.plusHours(1));

        Sesion sesionExistente = new Sesion(); // Simula una sesión que se solapa

        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findByTutorAndFecha(mockTutor, reservaRequest.getFecha())).thenReturn(List.of(disp));
        when(sesionRepository.findSesionesSolapadasParaTutor(anyLong(), any(LocalDate.class), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(sesionExistente)); // Devuelve una sesión solapada

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            sesionService.reservarTutoria(alumnoEmail, reservaRequest);
        });
        assertEquals("El horario seleccionado ya no está disponible o está ocupado.", exception.getMessage());
    }

    @Test
    void reservarTutoria_HoraFinAntesDeHoraInicio_ThrowsBadRequestException() {
        reservaRequest.setHoraFinal(LocalTime.of(9, 0)); // Hora fin antes de hora inicio (10:00)

        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(tutorRepository.findById(reservaRequest.getTutorId())).thenReturn(Optional.of(mockTutor));
        // No necesitamos mockear disponibilidad o sesiones solapadas si la validación de hora falla primero

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            sesionService.reservarTutoria(alumnoEmail, reservaRequest);
        });
        assertEquals("La hora de finalización debe ser posterior a la hora de inicio.", exception.getMessage());
    }
}