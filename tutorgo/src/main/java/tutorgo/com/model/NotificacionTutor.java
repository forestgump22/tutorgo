package tutorgo.com.model;

import tutorgo.com.enums.TipoNotificacionTutorEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "notificacion_tutores")
public class NotificacionTutor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @Column(length = 255, nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, columnDefinition = "tipo_notificacion_tutor_enum")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private TipoNotificacionTutorEnum tipo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}