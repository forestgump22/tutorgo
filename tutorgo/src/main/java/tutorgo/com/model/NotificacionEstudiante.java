package tutorgo.com.model;

import tutorgo.com.enums.TipoNotificacionEstEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "notificacion_estudiantes")
public class NotificacionEstudiante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @Column(length = 255, nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "tipo_notificacion_est_enum")
    private TipoNotificacionEstEnum tipo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;
}
