package tutorgo.com.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "enlaces_sesiones",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"sesion_id", "enlace"}),
                @UniqueConstraint(columnNames = {"sesion_id", "nombre"})
        }
)
public class EnlaceSesion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id", nullable = false)
    private Sesion sesion;

    @Column(length = 150, nullable = false)
    private String nombre;

    @Column(length = 500, nullable = false)
    private String enlace;
}