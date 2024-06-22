package tutorgo.com.service;

import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.Sesion;

import java.util.List;

public interface NotificacionService {
//    void enviarRecordatorioEstudiante(Estudiante estudiante, Sesion sesion);
//    void enviarRecordatorioTutor(Tutor tutor, Sesion sesion);

    List<NotificacionResponse> getMisNotificaciones(String userEmail);

}

