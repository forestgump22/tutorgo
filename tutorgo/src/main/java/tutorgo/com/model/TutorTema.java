package tutorgo.com.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tutores_temas")
public class TutorTema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    @ManyToOne
    @JoinColumn(name = "tema_id")
    private Tema tema;

    // Getters, Setters y Constructores
}
