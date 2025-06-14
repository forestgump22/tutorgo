package tutorgo.com.service;

import tutorgo.com.dto.request.UpdatePasswordRequest;
import tutorgo.com.dto.request.UserRegistrationRequest;
import tutorgo.com.dto.response.UserResponse;
import tutorgo.com.enums.RoleName;
import tutorgo.com.exception.BadRequestException;
import tutorgo.com.exception.DuplicateResourceException;
import tutorgo.com.exception.ResourceNotFoundException;
import tutorgo.com.mapper.UserMapper;
import tutorgo.com.model.Estudiante;
import tutorgo.com.model.Role;
import tutorgo.com.model.Tutor;
import tutorgo.com.model.User;
import tutorgo.com.repository.EstudianteRepository;
import tutorgo.com.repository.RoleRepository;
import tutorgo.com.repository.TutorRepository;
import tutorgo.com.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TutorRepository tutorRepository;
    private final EstudianteRepository estudianteRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;


    @Override
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Este correo ya está registrado. Pruebe iniciando sesión.");
        }

        Role userRole = roleRepository.findByNombre(request.getRol())
                .orElseThrow(() -> new BadRequestException("Rol no válido: " + request.getRol()));

        User user = new User();
        user.setNombre(request.getNombre());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        user.setFotoUrl(request.getFotoUrl());

        User savedUser = userRepository.save(user);

        if (userRole.getNombre() == RoleName.TUTOR) {
            if (request.getTarifaHora() == null || !StringUtils.hasText(request.getRubro())) {
                userRepository.delete(savedUser);
                throw new BadRequestException("Para el rol TUTOR, la tarifa por hora y el rubro son obligatorios.");
            }
            Tutor tutorProfile = new Tutor();
            tutorProfile.setUser(savedUser);
            tutorProfile.setTarifaHora(request.getTarifaHora());
            tutorProfile.setRubro(request.getRubro());
            tutorProfile.setBio(request.getBio());
            tutorProfile.setEstrellasPromedio(0.0f);
            Tutor savedTutorProfile = tutorRepository.save(tutorProfile);
            savedUser.setTutorProfile(savedTutorProfile);
        } else if (userRole.getNombre() == RoleName.ESTUDIANTE) {
            if (!StringUtils.hasText(request.getCentroEstudio())) {
                userRepository.delete(savedUser);
                throw new BadRequestException("Para el rol ESTUDIANTE, el centro de estudio es obligatorio.");
            }
            Estudiante studentProfile = new Estudiante();
            studentProfile.setUser(savedUser);
            studentProfile.setCentroEstudio(request.getCentroEstudio());
            Estudiante savedStudentProfile = estudianteRepository.save(studentProfile);
            savedUser.setStudentProfile(savedStudentProfile);
        }

        return userMapper.userToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public void updatePassword(String userEmail, UpdatePasswordRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + userEmail));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("La contraseña actual ingresada es incorrecta.");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("La nueva contraseña y su confirmación no coinciden.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("La nueva contraseña no puede ser igual a la contraseña actual.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }


    // Implementación de HU6
    @Override
    @Transactional
    public void deleteUserProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + userEmail + ". No se puede eliminar."));
        userRepository.delete(user);
    }
}