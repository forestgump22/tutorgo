package tutorgo.com.model;

import tutorgo.com.enums.TipoNotificacionEstEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

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

    // ***** CAMBIO IMPORTANTE AQUÍ *****
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, columnDefinition = "tipo_notificacion_est_enum")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TipoNotificacionEstEnum tipo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}