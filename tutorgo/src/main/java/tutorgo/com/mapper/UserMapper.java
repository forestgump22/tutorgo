package tutorgo.com.mapper;
import tutorgo.com.dto.response.StudentProfileResponse;
import tutorgo.com.dto.response.TutorProfileResponse;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse userToUserResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setNombre(user.getNombre());
        userResponse.setEmail(user.getEmail());
        userResponse.setFotoUrl(user.getFotoUrl());

        if (user.getRole() != null) {
            userResponse.setRol(user.getRole().getNombre());
        } else {
            userResponse.setRol(null); // O manejar como un error si el rol es siempre esperado
        }

        userResponse.setTutorProfile(tutorToTutorProfileResponse(user.getTutorProfile()));
        userResponse.setStudentProfile(estudianteToStudentProfileResponse(user.getStudentProfile()));

        return userResponse;
    }

    public TutorProfileResponse tutorToTutorProfileResponse(Tutor tutor) {
        if (tutor == null) {
            return null;
        }
        TutorProfileResponse dto = new TutorProfileResponse();
        dto.setId(tutor.getId());
        dto.setTarifaHora(tutor.getTarifaHora());
        dto.setRubro(tutor.getRubro());
        dto.setBio(tutor.getBio());
        dto.setEstrellasPromedio(tutor.getEstrellasPromedio());
        return dto;
    }

    public StudentProfileResponse estudianteToStudentProfileResponse(Estudiante estudiante) {
        if (estudiante == null) {
            return null;
        }
        StudentProfileResponse dto = new StudentProfileResponse();
        dto.setId(estudiante.getId());
        dto.setCentroEstudio(estudiante.getCentroEstudio());
        return dto;
    }
}