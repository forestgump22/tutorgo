package tutorgo.com.service;

import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.Sesion;

public interface NotificacionService {
    void enviarRecordatorioEstudiante(Estudiante estudiante, Sesion sesion);
    void enviarRecordatorioTutor(Tutor tutor, Sesion sesion);
}

