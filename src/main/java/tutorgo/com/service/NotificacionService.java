package tutorgo.com.service;

import tutorgo.com.dto.response.NotificacionResponse;

import java.util.List;

public interface NotificacionService {

    List<NotificacionResponse> getMisNotificaciones(String userEmail);

}

