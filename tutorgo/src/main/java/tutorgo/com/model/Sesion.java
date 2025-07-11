package tutorgo.com.model;

import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tutorgo.com.enums.EstadoSesionEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "sesiones")
public class Sesion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_inicial", nullable = false)
    private LocalDateTime horaInicial;

    @Column(name = "hora_final", nullable = false)
    private LocalDateTime horaFinal;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_estado", nullable = false, columnDefinition = "estado_sesion_enum")
    private EstadoSesionEnum tipoEstado;

    @OneToMany(mappedBy = "sesion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EnlaceSesion> enlaces = new ArrayList<>();

    @OneToOne(mappedBy = "sesion", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Resena resena;
}
