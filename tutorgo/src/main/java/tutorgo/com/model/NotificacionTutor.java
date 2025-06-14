package tutorgo.com.model;

import tutorgo.com.enums.TipoNotificacionTutorEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @Column(nullable = false, columnDefinition = "tipo_notificacion_tutor_enum")
    private TipoNotificacionTutorEnum tipo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String texto;
}
