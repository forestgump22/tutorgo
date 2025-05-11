package tutorgo.com.dto.response;

import tutorgo.com.enums.RoleName;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String nombre;
    private String email;
    private RoleName rol;
    private String fotoUrl;
    private TutorProfileResponse tutorProfile;
    private StudentProfileResponse studentProfile;
}
