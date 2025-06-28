// src/main/java/tutorgo/com/service/NotificacionSenderServiceImpl.java
package tutorgo.com.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tutorgo.com.enums.TipoNotificacionEstEnum;
import tutorgo.com.enums.TipoNotificacionTutorEnum;
import tutorgo.com.model.*;
import tutorgo.com.repository.NotificacionEstudianteRepository;
import tutorgo.com.repository.NotificacionTutorRepository;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class NotificacionSenderServiceImpl implements NotificacionSenderService {

    private final NotificacionEstudianteRepository notificacionEstudianteRepository;
    private final NotificacionTutorRepository notificacionTutorRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd 'de' MMMM 'a las' HH:mm");

    @Override
    public void enviarRecordatorioSesion(Sesion sesion) {
        if (sesion == null || sesion.getEstudiante() == null || sesion.getTutor() == null) {
            return;
        }

        // Enviar notificación al estudiante
        enviarRecordatorioAEstudiante(sesion);

        // Enviar notificación al tutor
        enviarRecordatorioATutor(sesion);
    }

    private void enviarRecordatorioAEstudiante(Sesion sesion) {
        Estudiante estudiante = sesion.getEstudiante();
        String titulo = "⏰ Recordatorio de tu tutoría";
        String texto = String.format(
                "Hola %s, te recordamos que tienes una sesión de %s con %s el %s.",
                estudiante.getUser().getNombre().split(" ")[0],
                sesion.getTutor().getRubro(),
                sesion.getTutor().getUser().getNombre(),
                sesion.getHoraInicial().format(FORMATTER)
        );

        NotificacionEstudiante notificacion = new NotificacionEstudiante();
        notificacion.setEstudiante(estudiante);
        notificacion.setTipo(TipoNotificacionEstEnum.RECORDATORIO);
        notificacion.setTitulo(titulo);
        notificacion.setTexto(texto);

        notificacionEstudianteRepository.save(notificacion);
    }

    private void enviarRecordatorioATutor(Sesion sesion) {
        Tutor tutor = sesion.getTutor();
        String titulo = "⏰ Recordatorio de tu próxima clase";
        String texto = String.format(
                "Hola %s, te recordamos tu clase de %s con %s el %s.",
                tutor.getUser().getNombre().split(" ")[0],
                tutor.getRubro(),
                sesion.getEstudiante().getUser().getNombre(),
                sesion.getHoraInicial().format(FORMATTER)
        );

        NotificacionTutor notificacion = new NotificacionTutor();
        notificacion.setTutor(tutor);
        notificacion.setTipo(TipoNotificacionTutorEnum.RECORDATORIO);
        notificacion.setTitulo(titulo);
        notificacion.setTexto(texto);

        notificacionTutorRepository.save(notificacion);
    }
}