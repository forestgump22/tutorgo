package tutorgo.com.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class DisponibilidadResponse {
    private Long id;
    private Long tutorId; // Para confirmar a qué tutor pertenece

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime horaInicial; // En la entidad es Timestamp

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime horaFinal;   // En la entidad es Timestamp
}