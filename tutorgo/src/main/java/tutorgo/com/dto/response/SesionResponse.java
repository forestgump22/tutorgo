package tutorgo.com.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import tutorgo.com.enums.EstadoSesionEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SesionResponse {
    private Long id;
    private Long tutorId;
    private String nombreTutor;
    private Long estudianteId;
    private String nombreEstudiante;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime horaInicial;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime horaFinal;
    private EstadoSesionEnum tipoEstado;
}