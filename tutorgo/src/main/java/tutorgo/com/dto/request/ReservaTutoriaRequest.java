package tutorgo.com.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaTutoriaRequest {

    @NotNull(message = "El ID del tutor es obligatorio")
    private Long tutorId;

    @NotNull(message = "La fecha de la tutoría es obligatoria")
    @FutureOrPresent(message = "La fecha de la tutoría no puede ser en el pasado")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de finalización es obligatoria")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaFinal;
}