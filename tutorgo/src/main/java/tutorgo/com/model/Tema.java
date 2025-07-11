package tutorgo.com.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "temas")
public class Tema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "tema_padre_id")
    private Tema temaPadre;

    @OneToMany(mappedBy = "temaPadre", cascade = CascadeType.ALL)
    private List<Tema> subtemas = new ArrayList<>();

    @OneToMany(mappedBy = "tema", cascade = CascadeType.ALL)
    private List<TutorTema> tutorTemas = new ArrayList<>();

    // Getters, Setters y Constructores
}

