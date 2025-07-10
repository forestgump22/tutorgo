package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tutorgo.com.dto.request.DisponibilidadRequest;
import tutorgo.com.dto.response.DisponibilidadResponse;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.DisponibilidadMapper;
import tutorgo.com.model.Disponibilidad;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.DisponibilidadRepository;
import tutorgo.com.repository.SesionRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.repository.UserRepository;

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
class DisponibilidadServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private TutorRepository tutorRepository;
    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private SesionRepository sesionRepository;
    @Mock private DisponibilidadMapper disponibilidadMapper;

    @InjectMocks private DisponibilidadServiceImpl disponibilidadService;

    private User mockUserTutor;
    private Tutor mockTutor;
    private DisponibilidadRequest disponibilidadRequest;
    private String tutorEmail = "tutor@example.com";

    @BeforeEach
    void setUp() {
        mockUserTutor = User.builder().id(1L).email(tutorEmail).build();
        mockTutor = Tutor.builder().id(1L).user(mockUserTutor).build();

        disponibilidadRequest = new DisponibilidadRequest();
        disponibilidadRequest.setFecha(LocalDate.now().plusDays(1));
        disponibilidadRequest.setHoraInicio(LocalTime.of(9, 0));
        disponibilidadRequest.setHoraFinal(LocalTime.of(12, 0));
    }

    // HU9 Escenario 1: Registro de disponibilidad
    @Test
    void addDisponibilidad_Success() {
        Disponibilidad nuevaDisp = new Disponibilidad(); // Simular lo que se guardaría
        DisponibilidadResponse mockResponse = new DisponibilidadResponse(); // Simular lo que el mapper devolvería

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findDisponibilidadesSolapadas(anyLong(), any(LocalDate.class), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(disponibilidadRepository.save(any(Disponibilidad.class))).thenReturn(nuevaDisp);
        when(disponibilidadMapper.toDisponibilidadResponse(nuevaDisp)).thenReturn(mockResponse);

        DisponibilidadResponse result = disponibilidadService.addDisponibilidad(tutorEmail, disponibilidadRequest);

        assertNotNull(result);
        verify(disponibilidadRepository).save(any(Disponibilidad.class));
    }

    // HU9 Escenario 3: Registro fallido - Hora final antes de inicial
    @Test
    void addDisponibilidad_HoraFinalAntesDeInicial_ThrowsBadRequestException() {
        disponibilidadRequest.setHoraFinal(LocalTime.of(8, 0)); // Error: 08:00 es antes de 09:00

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            disponibilidadService.addDisponibilidad(tutorEmail, disponibilidadRequest);
        });
        assertEquals("La hora de finalización debe ser posterior a la hora de inicio.", ex.getMessage());
    }

    // HU9 Escenario 3: Registro fallido - Solapamiento
    @Test
    void addDisponibilidad_Solapamiento_ThrowsBadRequestException() {
        Disponibilidad dispExistente = new Disponibilidad(); // Simular una disp que se solapa

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findDisponibilidadesSolapadas(anyLong(), any(LocalDate.class), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(dispExistente));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            disponibilidadService.addDisponibilidad(tutorEmail, disponibilidadRequest);
        });
        assertEquals("La nueva disponibilidad se solapa con una existente.", ex.getMessage());
    }

    // Pruebas para updateDisponibilidad, getDisponibilidadesByTutor, deleteDisponibilidad
    @Test
    void updateDisponibilidad_Success() {
        Long disponibilidadId = 1L;
        Disponibilidad existente = Disponibilidad.builder().id(disponibilidadId).tutor(mockTutor)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(10,0)))
                .horaFinal(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(11,0)))
                .build();
        DisponibilidadResponse mockResponse = new DisponibilidadResponse(); // Llenar datos

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findById(disponibilidadId)).thenReturn(Optional.of(existente));
        when(sesionRepository.countSesionesActivasEnRango(anyLong(), any(), any(), any())).thenReturn(0L); // No hay sesiones
        when(disponibilidadRepository.findDisponibilidadesSolapadasExcluyendoActual(anyLong(), any(), any(), any(), eq(disponibilidadId)))
                .thenReturn(Collections.emptyList()); // No hay solapamiento
        when(disponibilidadRepository.save(any(Disponibilidad.class))).thenReturn(existente); // Simula el guardado
        when(disponibilidadMapper.toDisponibilidadResponse(existente)).thenReturn(mockResponse);

        DisponibilidadResponse result = disponibilidadService.updateDisponibilidad(tutorEmail, disponibilidadId, disponibilidadRequest);
        assertNotNull(result);
        verify(disponibilidadRepository).save(existente);
    }

    @Test
    void updateDisponibilidad_HasActiveSessions_ThrowsBadRequestException() {
        Long disponibilidadId = 1L;
        Disponibilidad existente = Disponibilidad.builder().id(disponibilidadId).tutor(mockTutor)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(10,0)))
                .horaFinal(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(11,0)))
                .build();

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findById(disponibilidadId)).thenReturn(Optional.of(existente));
        when(sesionRepository.countSesionesActivasEnRango(anyLong(), any(), any(), any())).thenReturn(1L); // Hay sesiones

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            disponibilidadService.updateDisponibilidad(tutorEmail, disponibilidadId, disponibilidadRequest);
        });
        assertEquals("No se puede modificar la disponibilidad porque ya tiene sesiones reservadas o confirmadas en este horario.", ex.getMessage());
    }


    @Test
    void deleteDisponibilidad_Success() {
        Long disponibilidadId = 1L;
        Disponibilidad existente = Disponibilidad.builder().id(disponibilidadId).tutor(mockTutor).build();

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findById(disponibilidadId)).thenReturn(Optional.of(existente));
        when(sesionRepository.countSesionesActivasEnRango(anyLong(), any(), any(), any())).thenReturn(0L);

        assertDoesNotThrow(() -> disponibilidadService.deleteDisponibilidad(tutorEmail, disponibilidadId));
        verify(disponibilidadRepository).delete(existente);
    }

    @Test
    void deleteDisponibilidad_NotOwner_ThrowsForbiddenException() {
        Long disponibilidadId = 1L;
        Tutor otroTutor = Tutor.builder().id(99L).build(); // Un tutor diferente
        Disponibilidad existente = Disponibilidad.builder().id(disponibilidadId).tutor(otroTutor).build();

        when(userRepository.findByEmail(tutorEmail)).thenReturn(Optional.of(mockUserTutor));
        when(tutorRepository.findByUser(mockUserTutor)).thenReturn(Optional.of(mockTutor)); // mockTutor tiene ID 1L
        when(disponibilidadRepository.findById(disponibilidadId)).thenReturn(Optional.of(existente));

        assertThrows(ForbiddenException.class, () -> {
            disponibilidadService.deleteDisponibilidad(tutorEmail, disponibilidadId);
        });
    }

    @Test
    void getDisponibilidadesByTutorId_whenTutorExists_shouldReturnDisponibilidades() {
        // Arrange
        Long tutorId = 1L;
        Disponibilidad disp1 = new Disponibilidad(1L, mockTutor, LocalDate.now(), LocalDateTime.now(), LocalDateTime.now().plusHours(1));
        List<Disponibilidad> disponibilidades = List.of(disp1);

        DisponibilidadResponse resp1 = new DisponibilidadResponse();
        resp1.setId(1L);

        // Configuramos los mocks
        when(tutorRepository.findById(tutorId)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findByTutorOrderByFechaAscHoraInicialAsc(mockTutor)).thenReturn(disponibilidades);
        when(disponibilidadMapper.toDisponibilidadResponseList(disponibilidades)).thenReturn(List.of(resp1));

        // Act
        List<DisponibilidadResponse> result = disponibilidadService.getDisponibilidadesByTutorId(tutorId);

        // Assert
        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());

        // Verificamos que se llamaron a los métodos correctos
        verify(tutorRepository).findById(tutorId);
        verify(disponibilidadRepository).findByTutorOrderByFechaAscHoraInicialAsc(mockTutor);
        verify(disponibilidadMapper).toDisponibilidadResponseList(disponibilidades);
    }

    @Test
    void getDisponibilidadesByTutorId_whenTutorDoesNotExist_shouldThrowResourceNotFoundException() {
        // Arrange
        Long tutorId = 99L;
        when(tutorRepository.findById(tutorId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            disponibilidadService.getDisponibilidadesByTutorId(tutorId);
        });

        // Verificamos que los otros repositorios no fueron llamados
        verify(disponibilidadRepository, never()).findByTutorOrderByFechaAscHoraInicialAsc(any());
        verify(disponibilidadMapper, never()).toDisponibilidadResponseList(any());
    }

    @Test
    void getDisponibilidadesByTutorId_whenTutorHasNoDisponibilidades_shouldReturnEmptyList() {
        // Arrange
        Long tutorId = 1L;
        when(tutorRepository.findById(tutorId)).thenReturn(Optional.of(mockTutor));
        when(disponibilidadRepository.findByTutorOrderByFechaAscHoraInicialAsc(mockTutor)).thenReturn(Collections.emptyList());
        when(disponibilidadMapper.toDisponibilidadResponseList(Collections.emptyList())).thenReturn(Collections.emptyList());

        // Act
        List<DisponibilidadResponse> result = disponibilidadService.getDisponibilidadesByTutorId(tutorId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}