package tutorgo.com.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.enums.TipoNotificacionEstEnum;
import tutorgo.com.enums.TipoNotificacionTutorEnum;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.NotificacionEstudiante;
import tutorgo.com.model.NotificacionTutor;
import tutorgo.com.model.Sesion;
import tutorgo.com.model.Tutor;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.service.NotificacionService;

@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements NotificacionService {
    private final EstudianteRepository notificacionEstudianteRepository;
    private final TutorRepository notificacionTutorRepository;

    @Override
    public void enviarRecordatorioEstudiante(Estudiante estudiante, Sesion sesion) {
        NotificacionEstudiante notificacion = new NotificacionEstudiante();
        notificacion.setEstudiante(estudiante);
        notificacion.setTipo(TipoNotificacionEstEnum.RECORDATORIO);
        notificacion.setTexto("Recordatorio: Tienes una sesión el " + sesion.getFecha() + " a las " + sesion.getHoraInicial().toLocalTime());
    }

    @Override
    public void enviarRecordatorioTutor(Tutor tutor, Sesion sesion) {
        NotificacionTutor notificacion = new NotificacionTutor();
        notificacion.setTutor(tutor);
        notificacion.setTipo(TipoNotificacionTutorEnum.RECORDATORIO);
        notificacion.setTexto("Recordatorio: Tienes una sesión el " + sesion.getFecha() + " a las " + sesion.getHoraInicial().toLocalTime());
    }
}
