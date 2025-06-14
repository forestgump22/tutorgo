package tutorgo.com.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "resenas")
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sesion_id", nullable = false, unique = true)
    private Sesion sesion;

    @Column(nullable = false) // CHECK (calificacion BETWEEN 1 AND 5) se maneja a nivel BD
    private Integer calificacion;

    @Column(columnDefinition = "TEXT")
    private String comentario;
}
