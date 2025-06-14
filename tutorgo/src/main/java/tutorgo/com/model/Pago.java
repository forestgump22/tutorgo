package tutorgo.com.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import tutorgo.com.enums.EstadoPagoEnum;
import tutorgo.com.enums.MetodoPagoEnum;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pagos")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_id", nullable = false)
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estudiante_id", nullable = false)
    private Estudiante estudiante;

    @Column(nullable = false)
    private BigDecimal monto;

    @Column(name = "comision_plataforma", nullable = false)
    private BigDecimal comisionPlataforma;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, columnDefinition = "metodo_pago_enum")
    private MetodoPagoEnum metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_estado", nullable = false, columnDefinition = "estado_pago_enum")
    private EstadoPagoEnum tipoEstado;
}