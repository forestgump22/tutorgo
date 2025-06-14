package tutorgo.com.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tutorgo.com.model.Sesion;
import tutorgo.com.service.NotificacionService;
import tutorgo.com.repository.SesionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificacionScheduler {
    private final SesionRepository sesionRepository;
    private final NotificacionService notificacionService;

    // Ejecuta cada hora
    @Scheduled(cron = "0 0 * * * *")
    public void enviarRecordatorios24h() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime en24h = ahora.plusHours(24);
        // Buscar sesiones que empiezan exactamente en 24h (con margen de 1 hora)
        List<Sesion> sesiones = sesionRepository.findByHoraInicialBetween(en24h.minusMinutes(30), en24h.plusMinutes(30));
        for (Sesion sesion : sesiones) {
            if (sesion.getEstudiante() != null) {
                notificacionService.enviarRecordatorioEstudiante(sesion.getEstudiante(), sesion);
            }
            if (sesion.getTutor() != null) {
                notificacionService.enviarRecordatorioTutor(sesion.getTutor(), sesion);
            }
        }
    }
}

