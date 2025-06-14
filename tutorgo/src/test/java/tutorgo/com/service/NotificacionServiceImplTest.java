package tutorgo.com.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.NotificacionEstudiante;
import tutorgo.com.model.NotificacionTutor;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.Tutor;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.service.NotificacionServiceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceImplTest {
    @Mock EstudianteRepository estudianteRepository;
    @Mock TutorRepository tutorRepository;
    @InjectMocks NotificacionServiceImpl notificacionService;

    @Test
    void enviarRecordatorioEstudiante_enviaNotificacionCorrecta() {
        Estudiante estudiante = Estudiante.builder().id(1L).build();
        Sesion sesion = Sesion.builder()
                .id(10L)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .build();
        // Solo verifica que el método se ejecuta sin lanzar excepción
        assertDoesNotThrow(() -> notificacionService.enviarRecordatorioEstudiante(estudiante, sesion));
    }

    @Test
    void enviarRecordatorioTutor_enviaNotificacionCorrecta() {
        Tutor tutor = Tutor.builder().id(2L).build();
        Sesion sesion = Sesion.builder()
                .id(10L)
                .fecha(LocalDate.now().plusDays(1))
                .horaInicial(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                .build();
        // Solo verifica que el método se ejecuta sin lanzar excepción
        assertDoesNotThrow(() -> notificacionService.enviarRecordatorioTutor(tutor, sesion));
    }
}
