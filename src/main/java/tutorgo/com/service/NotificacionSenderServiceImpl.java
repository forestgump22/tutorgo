package tutorgo.com.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tutorgo.com.dto.response.NotificacionResponse;
import tutorgo.com.enums.TipoNotificacionEstEnum;
import tutorgo.com.enums.TipoNotificacionTutorEnum;
import tutorgo.com.model.*;
import tutorgo.com.repository.NotificacionEstudianteRepository;
import tutorgo.com.repository.NotificacionTutorRepository;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionSenderServiceImpl implements NotificacionSenderService {

    private final NotificacionEstudianteRepository notificacionEstudianteRepository;
    private final NotificacionTutorRepository notificacionTutorRepository;
    private final JavaMailSender mailSender;
    private final SimpMessagingTemplate messagingTemplate;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd 'de' MMMM 'a las' HH:mm");

    @Override
    public void enviarRecordatorioSesion(Sesion sesion) {
        if (sesion == null || sesion.getEstudiante() == null || sesion.getTutor() == null) {
            return;
        }

        log.info("Enviando recordatorio para sesión con ID: {}", sesion.getId());

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
                obtenerTemaPrincipal(sesion.getTutor()),
                sesion.getTutor().getUser().getNombre(),
                sesion.getHoraInicial().format(FORMATTER)
        );

        // 1. Crear notificación en la BD
        NotificacionEstudiante notificacion = new NotificacionEstudiante();
        notificacion.setEstudiante(estudiante);
        notificacion.setTipo(TipoNotificacionEstEnum.RECORDATORIO);
        notificacion.setTitulo(titulo);
        notificacion.setTexto(texto);

        NotificacionEstudiante notificacionGuardada = notificacionEstudianteRepository.save(notificacion);
        log.info("Notificación guardada para estudiante con ID: {}", estudiante.getId());

        // 2. Enviar correo electrónico al estudiante
        if (estudiante.getUser().getEmail() != null && !estudiante.getUser().getEmail().isEmpty()) {
            String cuerpoHtml = generarCuerpoHtmlEstudiante(estudiante, sesion, titulo, texto);
            enviarCorreo(estudiante.getUser().getEmail(), titulo, cuerpoHtml);
        }

        // 3. Enviar notificación por WebSocket (si se implementa para estudiantes en el futuro)
        // String destinoWs = "/topic/notificaciones/estudiante/" + estudiante.getId();
        // messagingTemplate.convertAndSend(destinoWs, NotificacionResponse.fromEntity(notificacionGuardada));
    }

    private void enviarRecordatorioATutor(Sesion sesion) {
        Tutor tutor = sesion.getTutor();
        String titulo = "⏰ Recordatorio de tu próxima clase";
        String texto = String.format(
                "Hola %s, te recordamos tu clase de %s con %s el %s.",
                tutor.getUser().getNombre().split(" ")[0],
                obtenerTemaPrincipal(tutor),
                sesion.getEstudiante().getUser().getNombre(),
                sesion.getHoraInicial().format(FORMATTER)
        );

        // 1. Crear notificación en la BD
        NotificacionTutor notificacion = new NotificacionTutor();
        notificacion.setTutor(tutor);
        notificacion.setTipo(TipoNotificacionTutorEnum.RECORDATORIO);
        notificacion.setTitulo(titulo);
        notificacion.setTexto(texto);

        NotificacionTutor notificacionGuardada = notificacionTutorRepository.save(notificacion);
        log.info("Notificación guardada para tutor con ID: {}", tutor.getId());

        // 2. Enviar correo electrónico al tutor
        if (tutor.getUser().getEmail() != null && !tutor.getUser().getEmail().isEmpty()) {
            String cuerpoHtml = generarCuerpoHtmlTutor(tutor, sesion, titulo, texto);
            enviarCorreo(tutor.getUser().getEmail(), titulo, cuerpoHtml);
        }

        // 3. Enviar notificación por WebSocket
        String destinoWs = "/topic/notificaciones/" + tutor.getId();
        messagingTemplate.convertAndSend(destinoWs, NotificacionResponse.fromEntity(notificacionGuardada));
        log.info("Notificación en tiempo real enviada al tutor ID {}", tutor.getId());
    }

    private String generarCuerpoHtmlEstudiante(Estudiante estudiante, Sesion sesion, String titulo, String texto) {
        return String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px;'>"
                + "<h2 style='color: #333;'>%s</h2>"
                + "<p>%s</p>"
                + "<p>Detalles de la sesión:</p>"
                + "<ul>"
                + "<li><strong>Tutor:</strong> %s</li>"
                + "<li><strong>Materia:</strong> %s</li>"
                + "<li><strong>Fecha y hora:</strong> %s</li>"
                + "</ul>"
                + "<p>¡Prepárate para aprovechar al máximo tu sesión!</p>"
                + "<div style='margin-top: 30px; font-size: 12px; color: #666;'>"
                + "<p>Este es un correo automático, por favor no responder.</p>"
                + "</div>"
                + "</div>",
                titulo,
                texto,
                sesion.getTutor().getUser().getNombre(),
                obtenerTemaPrincipal(sesion.getTutor()),
                sesion.getHoraInicial().format(FORMATTER)
        );
    }

    private String generarCuerpoHtmlTutor(Tutor tutor, Sesion sesion, String titulo, String texto) {
        return String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px;'>"
                + "<h2 style='color: #333;'>%s</h2>"
                + "<p>%s</p>"
                + "<p>Detalles de la sesión:</p>"
                + "<ul>"
                + "<li><strong>Estudiante:</strong> %s</li>"
                + "<li><strong>Materia:</strong> %s</li>"
                + "<li><strong>Fecha y hora:</strong> %s</li>"
                + "</ul>"
                + "<p>Recuerda estar preparado para brindar la mejor tutoría posible.</p>"
                + "<div style='margin-top: 30px; font-size: 12px; color: #666;'>"
                + "<p>Este es un correo automático, por favor no responder.</p>"
                + "</div>"
                + "</div>",
                titulo,
                texto,
                sesion.getEstudiante().getUser().getNombre(),
                obtenerTemaPrincipal(tutor),
                sesion.getHoraInicial().format(FORMATTER)
        );
    }

    private String obtenerTemaPrincipal(Tutor tutor) {
        if (tutor.getTutorTemas() != null && !tutor.getTutorTemas().isEmpty()) {
            // Obtener el primer tema asignado y buscar su tema padre
            var primerTema = tutor.getTutorTemas().get(0).getTema();
            if (primerTema.getTemaPadre() != null) {
                return primerTema.getTemaPadre().getNombre();
            }
        }
        return "Sin tema asignado";
    }

    /**
     * Envía un correo electrónico con formato HTML
     */
    private void enviarCorreo(String destinatario, String asunto, String cuerpoHtml) {
        log.info("Intentando enviar correo a: {}", destinatario);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true); // true indica que el cuerpo es HTML

            mailSender.send(message);
            log.info("Correo enviado exitosamente a {}", destinatario);
        } catch (MessagingException e) {
            log.error("Error al enviar correo a {}: {}", destinatario, e.getMessage());
        }
    }
}