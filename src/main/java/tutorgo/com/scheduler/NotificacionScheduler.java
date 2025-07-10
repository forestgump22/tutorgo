// src/main/java/tutorgo/com/scheduler/NotificacionScheduler.java
package tutorgo.com.scheduler;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tutorgo.com.enums.EstadoSesionEnum;
import tutorgo.com.model.Sesion;
import tutorgo.com.repository.SesionRepository;
import tutorgo.com.service.NotificacionSenderService; // ***** CAMBIO IMPORTANTE AQUÍ *****

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificacionScheduler.class);
    private final SesionRepository sesionRepository;
    // ***** USA EL NUEVO SERVICIO *****
    private final NotificacionSenderService notificacionSenderService;

    // Se ejecuta cada minuto para pruebas. Cambiar a "0 0 * * * *" para producción.
    @Scheduled(cron = "0 * * * * *")
    public void enviarRecordatorios24h() {
        log.info("Ejecutando scheduler de recordatorios de 24 horas...");

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime inicioRango = ahora.plusHours(23).plusMinutes(59); // Rango de 1 minuto
        LocalDateTime finRango = ahora.plusHours(24).plusMinutes(1);

        List<Sesion> sesionesProximas = sesionRepository.findByTipoEstadoAndHoraInicialBetween(
                EstadoSesionEnum.CONFIRMADO,
                inicioRango,
                finRango
        );

        if (!sesionesProximas.isEmpty()) {
            log.info("Se encontraron {} sesiones próximas para enviar recordatorios.", sesionesProximas.size());

            for (Sesion sesion : sesionesProximas) {
                // Llama al nuevo método del servicio que se encarga de todo
                notificacionSenderService.enviarRecordatorioSesion(sesion);
                log.info("Notificaciones de recordatorio generadas para la sesión ID: {}", sesion.getId());
            }
        }

        log.info("Scheduler de recordatorios finalizado.");
    }
}