package tutorgo.com.service;

import org.junit.jupiter.api.BeforeEach;
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
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.ForbiddenException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.PagoMapper;
import tutorgo.com.model.*;
import tutorgo.com.repository.*;
import tutorgo.com.enums.RoleName;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import tutorgo.com.dto.response.PagedResponse;


@ExtendWith(MockitoExtension.class)
class PagoServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private EstudianteRepository estudianteRepository;
    @Mock private SesionRepository sesionRepository;
    @Mock private PagoRepository pagoRepository;
    @Mock private TutorRepository tutorRepository;
    @Mock private DisponibilidadRepository disponibilidadRepository;
    @Mock private PagoMapper pagoMapper;

    @InjectMocks private PagoServiceImpl pagoService;

    private User mockUserAlumno;
    private Estudiante mockAlumno;
    private Tutor mockTutor;
    private Sesion mockSesionPendiente;
    private ConfirmarPagoRequest confirmarPagoRequest;
    private String alumnoEmail = "alumno.pago@example.com";
    private Long sesionId = 1L;

    @BeforeEach
    void setUp() {
        mockUserAlumno = User.builder().id(1L).email(alumnoEmail).build();
        mockAlumno = Estudiante.builder().id(1L).user(mockUserAlumno).build();
        mockTutor = Tutor.builder().id(1L).tarifaHora(60).user(User.builder().id(2L).build()).build(); // 60 por hora = 1 por minuto

        mockSesionPendiente = Sesion.builder()
                .id(sesionId)
                .estudiante(mockAlumno)
                .tutor(mockTutor)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(10, 0)))
                .horaFinal(LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(11, 0))) // 1 hora de duración
                .tipoEstado(EstadoSesionEnum.PENDIENTE)
                .build();

        confirmarPagoRequest = new ConfirmarPagoRequest();
        confirmarPagoRequest.setSesionId(sesionId);
        confirmarPagoRequest.setMetodoPago(MetodoPagoEnum.TARJETA_CREDITO);
    }

    // HU10 Escenario 1: Pago exitoso
    @Test
    void procesarPagoYConfirmarSesion_Success() {
        Pago mockPagoGuardado = new Pago();
        mockPagoGuardado.setId(1L);
        mockPagoGuardado.setTipoEstado(EstadoPagoEnum.COMPLETADO);

        PagoResponse mockPagoResponse = new PagoResponse();
        mockPagoResponse.setId(1L);
        mockPagoResponse.setTipoEstado(EstadoPagoEnum.COMPLETADO);

        // Definición de mockDispOriginal (como la tenías)
        Disponibilidad mockDispOriginal = Disponibilidad.builder()
                .id(10L).tutor(mockTutor).fecha(mockSesionPendiente.getFecha())
                .horaInicial(mockSesionPendiente.getHoraInicial().minusHours(1)) // 09:00
                .horaFinal(mockSesionPendiente.getHoraFinal().plusHours(1))     // 12:00
                .build();

        // --- GUARDA EL VALOR ORIGINAL ANTES DE QUE SE MODIFIQUE ---
        LocalDateTime finOriginalDeMockDisp = mockDispOriginal.getHoraFinal();
        // --- FIN DEL CAMBIO ---

        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));
        when(pagoRepository.save(any(Pago.class))).thenReturn(mockPagoGuardado);
        when(sesionRepository.save(any(Sesion.class))).thenReturn(mockSesionPendiente);
        when(disponibilidadRepository.findDisponibilidadQueEnvuelveElSlot(anyLong(), any(), any(), any()))
                .thenReturn(List.of(mockDispOriginal)); // El servicio recibe ESTE mockDispOriginal
        when(disponibilidadRepository.save(any(Disponibilidad.class))).thenAnswer(invocation -> {
            Disponibilidad d = invocation.getArgument(0);
            if (d.getId() == null) { // Para la nueva disponibilidad
                d.setId(System.nanoTime()); // Asigna un ID único simple para el test
            }
            return d;
        });
        when(pagoMapper.toPagoResponse(mockPagoGuardado)).thenReturn(mockPagoResponse);

        PagoResponse result = pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest);

        assertNotNull(result);
        assertEquals(EstadoPagoEnum.COMPLETADO, result.getTipoEstado());
        assertEquals(EstadoSesionEnum.CONFIRMADO, mockSesionPendiente.getTipoEstado());

        verify(pagoRepository).save(argThat(pago ->
                pago.getMonto().compareTo(new BigDecimal("60.00")) == 0 &&
                        pago.getComisionPlataforma().compareTo(new BigDecimal("6.00")) == 0
        ));
        verify(sesionRepository).save(mockSesionPendiente);

        ArgumentCaptor<Disponibilidad> dispCaptor = ArgumentCaptor.forClass(Disponibilidad.class);
        verify(disponibilidadRepository, times(2)).save(dispCaptor.capture());

        List<Disponibilidad> savedDisps = dispCaptor.getAllValues();

        // Debug (puedes mantenerlos o quitarlos una vez que funcione)
        System.out.println("Sesión Inicio: " + mockSesionPendiente.getHoraInicial() + ", Sesión Fin: " + mockSesionPendiente.getHoraFinal());
        System.out.println("Disp Original (antes de modificar por servicio) Inicio: " + mockDispOriginal.getHoraInicial() +
                ", Disp Original (antes de modificar por servicio) Fin: " + finOriginalDeMockDisp); // Usa la variable guardada
        System.out.println("Disp Original (después de modificar por servicio) HoraFinal: " + mockDispOriginal.getHoraFinal()); // Ahora es T10:00
        System.out.println("Primera Guardada (dispCaptor): ID=" + savedDisps.get(0).getId() + ", Inicio=" + savedDisps.get(0).getHoraInicial() + ", Fin=" + savedDisps.get(0).getHoraFinal());
        System.out.println("Segunda Guardada (dispCaptor): ID=" + savedDisps.get(1).getId() + ", Inicio=" + savedDisps.get(1).getHoraInicial() + ", Fin=" + savedDisps.get(1).getHoraFinal());

        // Aserciones
        // La primera guardada es la original acortada
        assertEquals(mockDispOriginal.getId(), savedDisps.get(0).getId()); // Mismo ID
        assertEquals(mockDispOriginal.getHoraInicial(), savedDisps.get(0).getHoraInicial()); // Inicio original de mockDispOriginal (09:00)
        assertEquals(mockSesionPendiente.getHoraInicial(), savedDisps.get(0).getHoraFinal()); // Fin es inicio de sesión (10:00)

        // La segunda guardada es la nueva creada después de la sesión
        assertNotNull(savedDisps.get(1).getId());
        assertNotEquals(mockDispOriginal.getId(), savedDisps.get(1).getId());
        assertEquals(mockSesionPendiente.getHoraFinal(), savedDisps.get(1).getHoraInicial()); // Inicio es fin de sesión (11:00)
        // --- USA EL VALOR ORIGINAL GUARDADO PARA LA COMPARACIÓN ---
        assertEquals(finOriginalDeMockDisp, savedDisps.get(1).getHoraFinal()); // Fin es el fin original de mockDispOriginal (12:00)
        // --- FIN DEL CAMBIO EN LA ASERCIÓN ---
    }

    @Test
    void procesarPagoYConfirmarSesion_SesionNoPendiente_ThrowsBadRequestException() {
        mockSesionPendiente.setTipoEstado(EstadoSesionEnum.CONFIRMADO); // Sesión ya confirmada

        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest);
        });
        assertEquals("Esta sesión no está pendiente de pago o ya ha sido procesada.", ex.getMessage());
    }

    @Test
    void procesarPagoYConfirmarSesion_SesionNoPerteneceAlAlumno_ThrowsForbiddenException() {
        Estudiante otroAlumno = Estudiante.builder().id(99L).build();
        mockSesionPendiente.setEstudiante(otroAlumno); // Sesión de otro alumno

        when(userRepository.findByEmail(alumnoEmail)).thenReturn(Optional.of(mockUserAlumno));
        when(estudianteRepository.findByUser(mockUserAlumno)).thenReturn(Optional.of(mockAlumno));
        when(sesionRepository.findById(sesionId)).thenReturn(Optional.of(mockSesionPendiente));

        assertThrows(ForbiddenException.class, () -> {
            pagoService.procesarPagoYConfirmarSesion(alumnoEmail, confirmarPagoRequest);
        });
    }

}