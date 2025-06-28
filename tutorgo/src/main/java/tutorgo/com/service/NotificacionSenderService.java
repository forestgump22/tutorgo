// src/main/java/tutorgo/com/service/NotificacionSenderService.java
package tutorgo.com.service;

import tutorgo.com.model.Sesion;

public interface NotificacionSenderService {
    void enviarRecordatorioSesion(Sesion sesion);
    // Aquí podrías añadir más métodos en el futuro, como:
    // void enviarNotificacionReserva(Sesion sesion);
    // void enviarNotificacionPago(Pago pago);
}